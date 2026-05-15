import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { IProductRepository } from 'src/domain/repositories/product.repository';
import { ITagRepository } from 'src/domain/repositories/tag.repository';
import { ProductEntity, ProductStatus } from 'src/domain/entities/product.entity';

interface Input {
  id: string;
  name?: string;
  slug?: string;
  description?: string | null;
  status?: ProductStatus;
  categoryId?: string;
  basePriceCents?: number;
  weightInGrams?: number | null;
  dimensionLength?: number | null;
  dimensionWidth?: number | null;
  dimensionHeight?: number | null;
  seoTitle?: string | null;
  seoDescription?: string | null;
  tagIds?: string[];
}

@Injectable()
export class UpdateProductUseCase {
  constructor(
    private readonly productRepository: IProductRepository,
    private readonly tagRepository: ITagRepository,
  ) {}

  async execute(input: Input): Promise<ProductEntity> {
    const product = await this.productRepository.get(input.id);
    if (!product) throw new NotFoundException('Product not found');

    if (input.slug && input.slug !== product.slug) {
      const exists = await this.productRepository.findBySlug(input.slug);
      if (exists) throw new ConflictException(`Slug "${input.slug}" already in use`);
    }

    product.update({
      name: input.name,
      slug: input.slug,
      description: input.description,
      status: input.status,
      categoryId: input.categoryId,
      basePrice: input.basePriceCents,
      weightInGrams: input.weightInGrams,
      dimensionLength: input.dimensionLength,
      dimensionWidth: input.dimensionWidth,
      dimensionHeight: input.dimensionHeight,
      seoTitle: input.seoTitle,
      seoDescription: input.seoDescription,
    });

    await this.productRepository.update(product);
    if (input.tagIds) {
      await this.tagRepository.syncProductTags(product.id.toString(), input.tagIds);
    }
    return product;
  }
}
