import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { IProductVariantRepository } from 'src/domain/repositories/product-variant.repository';
import { IProductRepository } from 'src/domain/repositories/product.repository';
import { IAttributeRepository } from 'src/domain/repositories/attribute.repository';
import { ProductVariantEntity } from 'src/domain/entities/product-variant.entity';

interface Input {
  productId: string;
  sku: string;
  /** Valores de atributo que essa variante carrega — 1 por atributo do produto. */
  attributeValueIds: string[];
  priceCents: number;
  stock?: number;
  isActive?: boolean;
  weightInGrams?: number | null;
}

@Injectable()
export class CreateVariantUseCase {
  constructor(
    private readonly variantRepository: IProductVariantRepository,
    private readonly productRepository: IProductRepository,
    private readonly attributeRepository: IAttributeRepository,
  ) {}

  async execute(input: Input): Promise<ProductVariantEntity> {
    const product = await this.productRepository.get(input.productId);
    if (!product) throw new NotFoundException('Produto não encontrado');
    if (product.type !== 'VARIABLE') {
      throw new BadRequestException('Só é possível adicionar variantes em produtos VARIABLE');
    }

    const existing = await this.variantRepository.findBySku(input.sku);
    if (existing) throw new ConflictException(`SKU "${input.sku}" já está em uso`);

    // Valida que cada attributeValueId existe e pertence a um atributo do produto
    const productAttributeIds = await this.productRepository.listAttributeIds(input.productId);
    const attrIdSet = new Set(productAttributeIds);
    const usedAttrIds = new Set<string>();
    for (const avId of input.attributeValueIds) {
      const v = await this.attributeRepository.getValue(avId);
      if (!v) throw new BadRequestException(`Valor de atributo ${avId} não encontrado`);
      if (!attrIdSet.has(v.attributeId.toString())) {
        throw new BadRequestException(
          `Valor "${v.name}" pertence a um atributo que não está vinculado a esse produto`,
        );
      }
      if (usedAttrIds.has(v.attributeId.toString())) {
        throw new BadRequestException(
          `Só pode haver um valor por atributo na mesma variante`,
        );
      }
      usedAttrIds.add(v.attributeId.toString());
    }
    if (usedAttrIds.size !== productAttributeIds.length) {
      throw new BadRequestException(
        'Variante precisa de exatamente um valor por atributo do produto',
      );
    }

    const variant = new ProductVariantEntity({
      productId: input.productId,
      sku: input.sku,
      price: input.priceCents,
      stock: input.stock ?? 0,
      isActive: input.isActive ?? true,
      weightInGrams: input.weightInGrams ?? null,
      isDefault: false,
    });

    await this.variantRepository.create(variant, input.attributeValueIds);
    return variant;
  }
}
