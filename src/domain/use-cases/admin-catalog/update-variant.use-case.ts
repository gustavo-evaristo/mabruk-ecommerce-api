import { Injectable, NotFoundException } from '@nestjs/common';
import { IProductVariantRepository } from 'src/domain/repositories/product-variant.repository';
import { ProductVariantEntity } from 'src/domain/entities/product-variant.entity';

interface Input {
  variantId: string;
  sku?: string;
  banho?: string;
  size?: string;
  priceCents?: number;
  isActive?: boolean;
}

@Injectable()
export class UpdateVariantUseCase {
  constructor(private readonly variantRepository: IProductVariantRepository) {}

  async execute(input: Input): Promise<ProductVariantEntity> {
    const v = await this.variantRepository.get(input.variantId);
    if (!v) throw new NotFoundException('Variant not found');

    v.update({
      sku: input.sku,
      banho: input.banho,
      size: input.size,
      price: input.priceCents,
      isActive: input.isActive,
    });

    await this.variantRepository.update(v);
    return v;
  }
}
