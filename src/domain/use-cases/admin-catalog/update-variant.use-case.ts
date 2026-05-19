import { Injectable, NotFoundException } from '@nestjs/common';
import { IProductVariantRepository } from 'src/domain/repositories/product-variant.repository';
import { ProductVariantEntity } from 'src/domain/entities/product-variant.entity';

interface Input {
  variantId: string;
  sku?: string;
  priceCents?: number;
  stock?: number;
  isActive?: boolean;
  weightInGrams?: number | null;
  /** Se passado, substitui completamente os valores de atributo da variante. */
  attributeValueIds?: string[];
}

@Injectable()
export class UpdateVariantUseCase {
  constructor(private readonly variantRepository: IProductVariantRepository) {}

  async execute(input: Input): Promise<ProductVariantEntity> {
    const v = await this.variantRepository.get(input.variantId);
    if (!v) throw new NotFoundException('Variante não encontrada');

    v.update({
      sku: input.sku,
      price: input.priceCents,
      stock: input.stock,
      isActive: input.isActive,
      weightInGrams: input.weightInGrams ?? undefined,
    });

    await this.variantRepository.update(v, input.attributeValueIds);
    return v;
  }
}
