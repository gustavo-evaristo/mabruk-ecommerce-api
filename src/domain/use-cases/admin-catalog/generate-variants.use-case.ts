import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { IProductRepository } from 'src/domain/repositories/product.repository';
import { IProductVariantRepository } from 'src/domain/repositories/product-variant.repository';
import { IAttributeRepository } from 'src/domain/repositories/attribute.repository';
import { ProductVariantEntity } from 'src/domain/entities/product-variant.entity';

interface Input {
  productId: string;
  /** Preço default (cents) pra cada variante gerada. Se omitido, usa o basePrice do produto. */
  defaultPriceCents?: number;
  /** Estoque default. */
  defaultStock?: number;
  /** Prefixo SKU; quando vazio, usa o slug do produto. SKU final = prefix + '-' + slugs de valores. */
  skuPrefix?: string;
}

/**
 * Gera todas as combinações cartesianas faltantes dos atributos do produto,
 * pulando combinações que já existem.
 */
@Injectable()
export class GenerateProductVariantsUseCase {
  constructor(
    private readonly productRepository: IProductRepository,
    private readonly variantRepository: IProductVariantRepository,
    private readonly attributeRepository: IAttributeRepository,
  ) {}

  async execute(input: Input): Promise<{ created: number; skipped: number }> {
    const product = await this.productRepository.get(input.productId);
    if (!product) throw new NotFoundException('Produto não encontrado');
    if (product.type !== 'VARIABLE') {
      throw new BadRequestException('Apenas produtos VARIABLE podem ter variantes geradas');
    }

    const attributeIds = await this.productRepository.listAttributeIds(input.productId);
    if (attributeIds.length === 0) {
      throw new BadRequestException('Produto não tem atributos definidos');
    }

    // carrega values de cada atributo
    const valuesPerAttribute: { attrSlug: string; values: { id: string; slug: string }[] }[] = [];
    for (const attrId of attributeIds) {
      const attr = await this.attributeRepository.get(attrId);
      if (!attr) continue;
      const values = await this.attributeRepository.listValues(attrId);
      if (values.length === 0) {
        throw new BadRequestException(`Atributo "${attr.name}" não tem valores cadastrados`);
      }
      valuesPerAttribute.push({
        attrSlug: attr.slug,
        values: values.map((v) => ({ id: v.id.toString(), slug: v.slug })),
      });
    }

    // produto cartesiano
    const combinations = this.cartesian(valuesPerAttribute);

    // variantes existentes (pra evitar duplicar)
    const existing = await this.variantRepository.listByProductId(input.productId);
    const existingValuesMap = await this.variantRepository.getValuesForVariants(
      existing.map((v) => v.id.toString()),
    );
    const existingSignatures = new Set(
      existing.map((v) => this.signature(existingValuesMap[v.id.toString()] ?? [])),
    );

    const prefix = (input.skuPrefix ?? product.slug).toUpperCase();
    const price = input.defaultPriceCents ?? product.basePrice;
    const stock = input.defaultStock ?? 0;

    let created = 0;
    let skipped = 0;
    for (const combo of combinations) {
      const sig = this.signatureFromCombo(combo);
      if (existingSignatures.has(sig)) {
        skipped++;
        continue;
      }
      const skuSuffix = combo.map((c) => c.valueSlug).join('-').toUpperCase();
      const sku = `${prefix}-${skuSuffix}`;
      const variant = new ProductVariantEntity({
        productId: input.productId,
        sku,
        price,
        stock,
        isActive: true,
        isDefault: false,
      });
      try {
        await this.variantRepository.create(
          variant,
          combo.map((c) => c.valueId),
        );
        created++;
      } catch {
        // colisão de SKU ou outro; pula
        skipped++;
      }
    }

    return { created, skipped };
  }

  private cartesian(
    attrs: { attrSlug: string; values: { id: string; slug: string }[] }[],
  ): { attrSlug: string; valueId: string; valueSlug: string }[][] {
    if (attrs.length === 0) return [];
    let result: { attrSlug: string; valueId: string; valueSlug: string }[][] = attrs[0].values.map(
      (v) => [{ attrSlug: attrs[0].attrSlug, valueId: v.id, valueSlug: v.slug }],
    );
    for (let i = 1; i < attrs.length; i++) {
      const next: typeof result = [];
      for (const sofar of result) {
        for (const v of attrs[i].values) {
          next.push([...sofar, { attrSlug: attrs[i].attrSlug, valueId: v.id, valueSlug: v.slug }]);
        }
      }
      result = next;
    }
    return result;
  }

  /** Assinatura única de uma combinação (ordenada por attrSlug). */
  private signatureFromCombo(
    combo: { attrSlug: string; valueId: string; valueSlug: string }[],
  ): string {
    return [...combo]
      .sort((a, b) => a.attrSlug.localeCompare(b.attrSlug))
      .map((c) => `${c.attrSlug}=${c.valueSlug}`)
      .join('|');
  }

  /** Assinatura a partir do retorno de getValuesForVariants. */
  private signature(values: { attributeSlug: string; valueSlug: string }[]): string {
    return [...values]
      .sort((a, b) => a.attributeSlug.localeCompare(b.attributeSlug))
      .map((v) => `${v.attributeSlug}=${v.valueSlug}`)
      .join('|');
  }
}
