import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { IProductVariantRepository } from 'src/domain/repositories/product-variant.repository';
import { IProductRepository } from 'src/domain/repositories/product.repository';
import { ProductVariantEntity } from 'src/domain/entities/product-variant.entity';

interface Input {
  productId: string;
  sku: string;
  banho: string;
  size: string;
  priceCents: number;
  stock?: number;
  isActive?: boolean;
}

@Injectable()
export class CreateVariantUseCase {
  constructor(
    private readonly variantRepository: IProductVariantRepository,
    private readonly productRepository: IProductRepository,
  ) {}

  async execute(input: Input): Promise<ProductVariantEntity> {
    const product = await this.productRepository.get(input.productId);
    if (!product) throw new NotFoundException('Product not found');

    const existing = await this.variantRepository.findBySku(input.sku);
    if (existing) throw new ConflictException(`SKU "${input.sku}" already exists`);

    const variant = new ProductVariantEntity({
      productId: input.productId,
      sku: input.sku,
      banho: input.banho,
      size: input.size,
      price: input.priceCents,
      stock: input.stock ?? 0,
      isActive: input.isActive ?? true,
    });

    await this.variantRepository.create(variant);
    return variant;
  }
}
