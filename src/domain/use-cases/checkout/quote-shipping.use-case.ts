import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { ICartRepository } from 'src/domain/repositories/cart.repository';
import { IProductVariantRepository } from 'src/domain/repositories/product-variant.repository';
import { IProductRepository } from 'src/domain/repositories/product.repository';
import { ShippingCalculator, ShippingQuote } from 'src/domain/services/shipping-calculator';
import { StoreConfigService } from 'src/domain/services/store-config';
import { CEP } from 'src/domain/entities/vos';

interface Input {
  cartId: string;
  zipCode: string;
  customerId?: string | null;
  guestToken?: string | null;
}

export interface QuoteShippingOutput {
  options: ShippingQuote[];
  subtotalCents: number;
}

@Injectable()
export class QuoteShippingUseCase {
  constructor(
    private readonly cartRepository: ICartRepository,
    private readonly variantRepository: IProductVariantRepository,
    private readonly productRepository: IProductRepository,
    private readonly shippingCalculator: ShippingCalculator,
    private readonly storeConfig: StoreConfigService,
  ) {}

  async execute(input: Input): Promise<QuoteShippingOutput> {
    const toZip = CEP.create(input.zipCode).value;
    const fromZip = await this.storeConfig.getOriginZip();

    const data = await this.cartRepository.getWithItems(input.cartId);
    if (!data) throw new NotFoundException('Cart not found');
    if (!data.cart.canBeAccessedBy({ customerId: input.customerId, guestToken: input.guestToken })) {
      throw new ForbiddenException();
    }
    if (data.items.length === 0) {
      throw new NotFoundException('Cart vazio');
    }

    const variants = await this.variantRepository.listByIds(
      data.items.map((i) => i.variantId.toString()),
    );
    const productIds = Array.from(new Set(variants.map((v) => v.productId.toString())));
    const products = await Promise.all(productIds.map((id) => this.productRepository.get(id)));

    let subtotalCents = 0;
    const quoteItems = data.items.map((it) => {
      const v = variants.find((x) => x.id.toString() === it.variantId.toString());
      const p = v ? products.find((px) => px?.id.toString() === v.productId.toString()) : null;
      const valueCents = (v?.price ?? 0) * it.quantity;
      subtotalCents += valueCents;
      return {
        weightInGrams: p?.weightInGrams ?? 50,
        lengthCm: p?.dimensionLength ?? 16,
        widthCm: p?.dimensionWidth ?? 11,
        heightCm: p?.dimensionHeight ?? 2,
        valueCents: v?.price ?? 0,
        quantity: it.quantity,
      };
    });

    const options = await this.shippingCalculator.quote({
      fromZip,
      toZip,
      items: quoteItems,
      subtotalCents,
    });

    return { options, subtotalCents };
  }
}
