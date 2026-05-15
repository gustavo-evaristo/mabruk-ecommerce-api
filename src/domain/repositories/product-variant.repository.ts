import { ProductVariantEntity } from '../entities/product-variant.entity';

export abstract class IProductVariantRepository {
  abstract get(id: string): Promise<ProductVariantEntity | null>;
  abstract findBySku(sku: string): Promise<ProductVariantEntity | null>;
  abstract listByProductId(productId: string): Promise<ProductVariantEntity[]>;
  abstract listByIds(ids: string[]): Promise<ProductVariantEntity[]>;
  abstract create(variant: ProductVariantEntity): Promise<void>;
  abstract update(variant: ProductVariantEntity): Promise<void>;
  abstract delete(id: string): Promise<void>;
}
