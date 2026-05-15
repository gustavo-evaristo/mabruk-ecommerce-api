import { ProductImageEntity } from '../entities/product-image.entity';

export abstract class IProductImageRepository {
  abstract listByProductId(productId: string): Promise<ProductImageEntity[]>;
  abstract get(id: string): Promise<ProductImageEntity | null>;
  abstract create(image: ProductImageEntity): Promise<void>;
  abstract delete(id: string): Promise<void>;
  abstract reorder(productId: string, orderedIds: string[]): Promise<void>;
}
