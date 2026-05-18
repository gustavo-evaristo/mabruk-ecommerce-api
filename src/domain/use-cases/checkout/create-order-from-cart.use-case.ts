import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ICartRepository } from 'src/domain/repositories/cart.repository';
import { ICustomerRepository } from 'src/domain/repositories/customer.repository';
import { IProductRepository } from 'src/domain/repositories/product.repository';
import { IProductVariantRepository } from 'src/domain/repositories/product-variant.repository';
import { IProductImageRepository } from 'src/domain/repositories/product-image.repository';
import { IOrderRepository } from 'src/domain/repositories/order.repository';
import { IShipmentRepository } from 'src/domain/repositories/shipment.repository';
import { ShippingCalculator } from 'src/domain/services/shipping-calculator';
import { StoreConfigService } from 'src/domain/services/store-config';
import { MailSender } from 'src/domain/services/mail-sender';
import {
  CustomerSnapshot,
  OrderEntity,
  ShippingAddressSnapshot,
} from 'src/domain/entities/order.entity';
import { OrderItemEntity } from 'src/domain/entities/order-item.entity';
import { ShipmentEntity } from 'src/domain/entities/shipment.entity';
import { CEP } from 'src/domain/entities/vos';

interface Input {
  cartId: string;
  shippingAddress: ShippingAddressSnapshot;
  shippingChoice: { service: string; carrier: string };
  customer: CustomerSnapshot; // dados do comprador (logado preenche da conta; guest informa)
  customerId?: string | null;
  guestToken?: string | null;
  notes?: string;
}

export interface CreateOrderOutput {
  orderId: string;
  orderNumber: string;
  grandTotalCents: number;
}

@Injectable()
export class CreateOrderFromCartUseCase {
  constructor(
    private readonly cartRepository: ICartRepository,
    private readonly customerRepository: ICustomerRepository,
    private readonly productRepository: IProductRepository,
    private readonly variantRepository: IProductVariantRepository,
    private readonly imageRepository: IProductImageRepository,
    private readonly orderRepository: IOrderRepository,
    private readonly shipmentRepository: IShipmentRepository,
    private readonly shippingCalculator: ShippingCalculator,
    private readonly mailSender: MailSender,
    private readonly storeConfig: StoreConfigService,
  ) {}

  async execute(input: Input): Promise<CreateOrderOutput> {
    const data = await this.cartRepository.getWithItems(input.cartId);
    if (!data) throw new NotFoundException('Cart not found');
    if (!data.cart.canBeAccessedBy({ customerId: input.customerId, guestToken: input.guestToken })) {
      throw new ForbiddenException();
    }
    if (data.items.length === 0) {
      throw new BadRequestException('Carrinho vazio');
    }

    // Snapshots de variantes/produtos/imagens
    const variants = await this.variantRepository.listByIds(
      data.items.map((i) => i.variantId.toString()),
    );
    const productIds = Array.from(new Set(variants.map((v) => v.productId.toString())));
    const [products, imagesByProduct] = await Promise.all([
      Promise.all(productIds.map((id) => this.productRepository.get(id))),
      Promise.all(productIds.map((id) => this.imageRepository.listByProductId(id))),
    ]);

    // Validações de estoque (sem decrementar — só ao pagar)
    let itemsTotal = 0;
    for (const it of data.items) {
      const v = variants.find((x) => x.id.toString() === it.variantId.toString());
      if (!v || !v.isActive) throw new BadRequestException('Variante indisponível no carrinho');
      if (v.stock < it.quantity) {
        throw new ConflictException(`Estoque insuficiente para ${v.sku}`);
      }
      itemsTotal += v.price * it.quantity;
    }

    // Cotação de frete (autoritativa no servidor — não confia no que o front mandou)
    const toZip = CEP.create(input.shippingAddress.zipCode).value;
    const fromZip = await this.storeConfig.getOriginZip();
    const options = await this.shippingCalculator.quote({
      fromZip,
      toZip,
      items: data.items.map((it) => {
        const v = variants.find((x) => x.id.toString() === it.variantId.toString());
        const p = v ? products.find((px) => px?.id.toString() === v.productId.toString()) : null;
        return {
          weightInGrams: p?.weightInGrams ?? 50,
          lengthCm: p?.dimensionLength ?? 16,
          widthCm: p?.dimensionWidth ?? 11,
          heightCm: p?.dimensionHeight ?? 2,
          valueCents: v?.price ?? 0,
          quantity: it.quantity,
        };
      }),
      subtotalCents: itemsTotal,
    });

    const chosen = options.find(
      (o) => o.carrier === input.shippingChoice.carrier && o.service === input.shippingChoice.service,
    );
    if (!chosen) throw new BadRequestException('Opção de frete inválida');

    const shippingTotal = chosen.costCents;
    const grandTotal = itemsTotal + shippingTotal;

    // Order number sequencial
    const orderNumber = await this.orderRepository.nextOrderNumber();

    const order = new OrderEntity({
      number: orderNumber,
      customerId: input.customerId ?? null,
      customerSnapshot: input.customer,
      itemsTotal,
      shippingTotal,
      grandTotal,
      shippingAddress: { ...input.shippingAddress, zipCode: toZip },
      notes: input.notes,
    });

    const items: OrderItemEntity[] = data.items.map((it) => {
      const v = variants.find((x) => x.id.toString() === it.variantId.toString())!;
      const p = products.find((px) => px?.id.toString() === v.productId.toString())!;
      const idx = productIds.indexOf(v.productId.toString());
      const firstImg = imagesByProduct[idx]?.[0]?.url ?? null;
      return new OrderItemEntity({
        orderId: order.id,
        variantId: v.id,
        productSnapshot: {
          productId: v.productId.toString(),
          name: p.name,
          slug: p.slug,
          imageUrl: firstImg,
          banho: v.banho,
          size: v.size,
          sku: v.sku,
        },
        unitPrice: v.price,
        quantity: it.quantity,
      });
    });

    await this.orderRepository.createWithItems(order, items);
    await this.shipmentRepository.upsert(
      new ShipmentEntity({
        orderId: order.id,
        carrier: chosen.carrier,
        service: chosen.service,
        cost: chosen.costCents,
        estimatedDays: chosen.estimatedDays,
      }),
    );

    // Limpa carrinho após criar o pedido
    await this.cartRepository.clearItems(input.cartId);

    // Envia e-mail de pedido criado (mock loga no console)
    try {
      await this.mailSender.send({
        to: input.customer.email,
        template: 'order_created',
        data: {
          customerName: input.customer.name,
          orderNumber: order.number,
          grandTotalCents: order.grandTotal,
          items: items.map((i) => ({
            name: i.productSnapshot.name,
            banho: i.productSnapshot.banho,
            size: i.productSnapshot.size,
            quantity: i.quantity,
            unitPrice: i.unitPrice,
          })),
        },
      });
    } catch {
      // não falhar criação do pedido por erro de e-mail
    }

    return {
      orderId: order.id.toString(),
      orderNumber: order.number,
      grandTotalCents: order.grandTotal,
    };
  }
}
