import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { ICartRepository } from 'src/domain/repositories/cart.repository';
import { IProductVariantRepository } from 'src/domain/repositories/product-variant.repository';
import { IProductRepository } from 'src/domain/repositories/product.repository';
import { IProductImageRepository } from 'src/domain/repositories/product-image.repository';
import { CartEntity } from 'src/domain/entities/cart.entity';

export interface CartLine {
  itemId: string;
  variantId: string;
  productId: string;
  productSlug: string;
  productName: string;
  banho: string;
  size: string;
  sku: string;
  unitPriceCents: number;
  quantity: number;
  lineTotalCents: number;
  stock: number;
  imageUrl?: string | null;
}

export interface CartView {
  cart: CartEntity;
  lines: CartLine[];
  subtotalCents: number;
  totalItems: number;
}

interface Input {
  cartId: string;
  customerId?: string | null;
  guestToken?: string | null;
}

@Injectable()
export class GetCartUseCase {
  constructor(
    private readonly cartRepository: ICartRepository,
    private readonly variantRepository: IProductVariantRepository,
    private readonly productRepository: IProductRepository,
    private readonly imageRepository: IProductImageRepository,
  ) {}

  async execute(input: Input): Promise<CartView> {
    const data = await this.cartRepository.getWithItems(input.cartId);
    if (!data) throw new NotFoundException('Cart not found');

    if (!data.cart.canBeAccessedBy({ customerId: input.customerId, guestToken: input.guestToken })) {
      throw new ForbiddenException('Cart access denied');
    }

    if (data.items.length === 0) {
      return { cart: data.cart, lines: [], subtotalCents: 0, totalItems: 0 };
    }

    const variantIds = data.items.map((i) => i.variantId.toString());
    const variants = await this.variantRepository.listByIds(variantIds);

    const productIds = Array.from(new Set(variants.map((v) => v.productId.toString())));
    const products = await Promise.all(productIds.map((id) => this.productRepository.get(id)));
    const imagesPerProduct = await Promise.all(
      productIds.map((id) => this.imageRepository.listByProductId(id)),
    );

    const lines: CartLine[] = data.items.map((it) => {
      const v = variants.find((x) => x.id.toString() === it.variantId.toString());
      const p = v ? products.find((px) => px?.id.toString() === v.productId.toString()) : null;
      const productIdx = v ? productIds.indexOf(v.productId.toString()) : -1;
      const imgs = productIdx >= 0 ? imagesPerProduct[productIdx] : [];
      const imageUrl = imgs[0]?.url ?? null;
      const unitPrice = v?.price ?? 0;
      return {
        itemId: it.id.toString(),
        variantId: it.variantId.toString(),
        productId: v?.productId.toString() ?? '',
        productSlug: p?.slug ?? '',
        productName: p?.name ?? '',
        banho: v?.banho ?? '',
        size: v?.size ?? '',
        sku: v?.sku ?? '',
        unitPriceCents: unitPrice,
        quantity: it.quantity,
        lineTotalCents: unitPrice * it.quantity,
        stock: v?.stock ?? 0,
        imageUrl,
      };
    });

    const subtotalCents = lines.reduce((acc, l) => acc + l.lineTotalCents, 0);
    const totalItems = lines.reduce((acc, l) => acc + l.quantity, 0);

    return { cart: data.cart, lines, subtotalCents, totalItems };
  }
}
