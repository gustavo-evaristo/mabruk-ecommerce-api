import { ProductVariantEntity } from '../entities/product-variant.entity';

/** Valores de atributo de uma variante (output do repositório). */
export interface VariantAttributeValue {
  attributeId: string;
  attributeSlug: string;
  attributeName: string;
  attributeType: 'SELECT' | 'COLOR';
  valueId: string;
  valueSlug: string;
  valueName: string;
  valueHex: string | null;
}

export abstract class IProductVariantRepository {
  abstract get(id: string): Promise<ProductVariantEntity | null>;
  abstract findBySku(sku: string): Promise<ProductVariantEntity | null>;
  abstract listByProductId(productId: string): Promise<ProductVariantEntity[]>;
  abstract listByIds(ids: string[]): Promise<ProductVariantEntity[]>;
  /** Cria a variante e, em transação, persiste os attribute_value ids associados. */
  abstract create(variant: ProductVariantEntity, attributeValueIds: string[]): Promise<void>;
  /** Atualiza a variante; se `attributeValueIds` for passado, substitui completamente os valores. */
  abstract update(variant: ProductVariantEntity, attributeValueIds?: string[]): Promise<void>;
  abstract delete(id: string): Promise<void>;
  /** Carrega values agrupados por variant. */
  abstract getValuesForVariants(
    variantIds: string[],
  ): Promise<Record<string, VariantAttributeValue[]>>;
}
