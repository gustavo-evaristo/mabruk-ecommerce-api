import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { IProductRepository } from 'src/domain/repositories/product.repository';
import { ICategoryRepository } from 'src/domain/repositories/category.repository';
import { ITagRepository } from 'src/domain/repositories/tag.repository';
import { ProductEntity, ProductStatus } from 'src/domain/entities/product.entity';
import { Slug } from 'src/domain/entities/vos';

interface Input {
  name: string;
  slug?: string;
  description?: string;
  status?: ProductStatus;
  categoryId: string;
  basePriceCents: number;
  garantia?: string;
  cuidados?: string;
  weightInGrams?: number;
  dimensionLength?: number;
  dimensionWidth?: number;
  dimensionHeight?: number;
  seoTitle?: string;
  seoDescription?: string;
  tagIds?: string[];
}

@Injectable()
export class CreateProductUseCase {
  constructor(
    private readonly productRepository: IProductRepository,
    private readonly categoryRepository: ICategoryRepository,
    private readonly tagRepository: ITagRepository,
  ) {}

  async execute(input: Input): Promise<ProductEntity> {
    const slug = input.slug ? Slug.from(input.slug).value : Slug.fromText(input.name).value;

    const exists = await this.productRepository.findBySlug(slug);
    if (exists) {
      throw new ConflictException(`Product with slug "${slug}" already exists`);
    }

    const category = await this.categoryRepository.get(input.categoryId);
    if (!category) {
      throw new NotFoundException('Category not found');
    }

    const product = new ProductEntity({
      slug,
      name: input.name,
      description: input.description,
      status: input.status ?? 'DRAFT',
      categoryId: input.categoryId,
      basePrice: input.basePriceCents,
      garantia: input.garantia,
      cuidados: input.cuidados,
      weightInGrams: input.weightInGrams,
      dimensionLength: input.dimensionLength,
      dimensionWidth: input.dimensionWidth,
      dimensionHeight: input.dimensionHeight,
      seoTitle: input.seoTitle,
      seoDescription: input.seoDescription,
    });

    await this.productRepository.create(product);
    if (input.tagIds && input.tagIds.length > 0) {
      await this.tagRepository.syncProductTags(product.id.toString(), input.tagIds);
    }

    return product;
  }
}
