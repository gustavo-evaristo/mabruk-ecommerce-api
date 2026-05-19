import {
  Injectable,
  ConflictException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { IProductRepository } from 'src/domain/repositories/product.repository';
import { IProductVariantRepository } from 'src/domain/repositories/product-variant.repository';
import { ICategoryRepository } from 'src/domain/repositories/category.repository';
import { ITagRepository } from 'src/domain/repositories/tag.repository';
import { ProductEntity, ProductStatus, ProductType } from 'src/domain/entities/product.entity';
import { ProductVariantEntity } from 'src/domain/entities/product-variant.entity';
import { Slug } from 'src/domain/entities/vos';

interface Input {
  name: string;
  slug?: string;
  description?: string;
  status?: ProductStatus;
  type?: ProductType;
  categoryId: string;
  basePriceCents: number;
  /** Obrigatório para SIMPLE. */
  sku?: string;
  /** Obrigatório para SIMPLE. */
  priceCents?: number;
  /** Estoque para SIMPLE (default 0). */
  stock?: number;
  weightInGrams?: number;
  dimensionLength?: number;
  dimensionWidth?: number;
  dimensionHeight?: number;
  seoTitle?: string;
  seoDescription?: string;
  tagIds?: string[];
  /** IDs dos atributos que esse produto VARIABLE usa. */
  attributeIds?: string[];
}

@Injectable()
export class CreateProductUseCase {
  constructor(
    private readonly productRepository: IProductRepository,
    private readonly variantRepository: IProductVariantRepository,
    private readonly categoryRepository: ICategoryRepository,
    private readonly tagRepository: ITagRepository,
  ) {}

  async execute(input: Input): Promise<ProductEntity> {
    const type: ProductType = input.type ?? 'SIMPLE';

    if (type === 'SIMPLE') {
      if (!input.sku?.trim()) throw new BadRequestException('SKU obrigatório para produto simples');
      if (!input.priceCents || input.priceCents <= 0) {
        throw new BadRequestException('Preço obrigatório para produto simples');
      }
      const skuConflict = await this.variantRepository.findBySku(input.sku.trim());
      if (skuConflict) throw new ConflictException(`SKU "${input.sku}" já está em uso`);
    } else {
      if (!input.attributeIds?.length) {
        throw new BadRequestException(
          'Produto variável precisa de ao menos um atributo (ex: Cor, Banho)',
        );
      }
    }

    const slug = input.slug ? Slug.from(input.slug).value : Slug.fromText(input.name).value;

    const exists = await this.productRepository.findBySlug(slug);
    if (exists) throw new ConflictException(`Produto com slug "${slug}" já existe`);

    const category = await this.categoryRepository.get(input.categoryId);
    if (!category) throw new NotFoundException('Categoria não encontrada');

    const product = new ProductEntity({
      slug,
      name: input.name,
      description: input.description,
      status: input.status ?? 'DRAFT',
      type,
      categoryId: input.categoryId,
      basePrice: input.basePriceCents,
      sku: type === 'SIMPLE' ? input.sku!.trim() : null,
      price: type === 'SIMPLE' ? input.priceCents! : null,
      stock: type === 'SIMPLE' ? input.stock ?? 0 : 0,
      weightInGrams: input.weightInGrams,
      dimensionLength: input.dimensionLength,
      dimensionWidth: input.dimensionWidth,
      dimensionHeight: input.dimensionHeight,
      seoTitle: input.seoTitle,
      seoDescription: input.seoDescription,
    });

    await this.productRepository.create(product, type === 'VARIABLE' ? input.attributeIds! : []);

    // Para SIMPLE: cria a variante "default" invisível que carrega SKU/preço/estoque reais
    if (type === 'SIMPLE') {
      const defaultVariant = new ProductVariantEntity({
        productId: product.id,
        sku: product.sku!,
        price: product.price!,
        stock: product.stock,
        isDefault: true,
      });
      await this.variantRepository.create(defaultVariant, []);
    }

    if (input.tagIds && input.tagIds.length > 0) {
      await this.tagRepository.syncProductTags(product.id.toString(), input.tagIds);
    }

    return product;
  }
}
