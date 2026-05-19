import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { IProductRepository } from 'src/domain/repositories/product.repository';
import { IProductVariantRepository } from 'src/domain/repositories/product-variant.repository';
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
  /** Sincronizado com a variante default se type=SIMPLE */
  sku?: string;
  priceCents?: number;
  stock?: number;
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
    private readonly variantRepository: IProductVariantRepository,
    private readonly tagRepository: ITagRepository,
  ) {}

  async execute(input: Input): Promise<ProductEntity> {
    const product = await this.productRepository.get(input.id);
    if (!product) throw new NotFoundException('Produto não encontrado');

    if (input.slug && input.slug !== product.slug) {
      const exists = await this.productRepository.findBySlug(input.slug);
      if (exists) throw new ConflictException(`Slug "${input.slug}" já está em uso`);
    }

    // Em SIMPLE, o "preço base" do produto espelha o "preço" da variante default
    const effectiveBasePrice =
      product.type === 'SIMPLE' && input.priceCents !== undefined
        ? input.priceCents
        : input.basePriceCents;

    product.update({
      name: input.name,
      slug: input.slug,
      description: input.description,
      status: input.status,
      categoryId: input.categoryId,
      basePrice: effectiveBasePrice,
      sku: input.sku,
      price: input.priceCents,
      stock: input.stock,
      weightInGrams: input.weightInGrams,
      dimensionLength: input.dimensionLength,
      dimensionWidth: input.dimensionWidth,
      dimensionHeight: input.dimensionHeight,
      seoTitle: input.seoTitle,
      seoDescription: input.seoDescription,
    });

    await this.productRepository.update(product);

    // Sincroniza variante default se SIMPLE e SKU/preço/estoque mudaram
    if (product.type === 'SIMPLE') {
      const variants = await this.variantRepository.listByProductId(product.id.toString());
      const defaultVariant = variants.find((v) => v.isDefault) ?? variants[0];
      if (defaultVariant) {
        let changed = false;
        if (input.sku && defaultVariant.sku !== input.sku) {
          defaultVariant.update({ sku: input.sku });
          changed = true;
        }
        if (input.priceCents && defaultVariant.price !== input.priceCents) {
          defaultVariant.update({ price: input.priceCents });
          changed = true;
        }
        if (input.stock !== undefined && defaultVariant.stock !== input.stock) {
          defaultVariant.update({ stock: input.stock });
          changed = true;
        }
        if (changed) await this.variantRepository.update(defaultVariant);
      }
    }

    if (input.tagIds) {
      await this.tagRepository.syncProductTags(product.id.toString(), input.tagIds);
    }
    return product;
  }
}
