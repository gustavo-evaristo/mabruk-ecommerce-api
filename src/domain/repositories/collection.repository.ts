import { CollectionEntity } from '../entities/collection.entity';
import { ProductEntity } from '../entities/product.entity';

export interface CollectionWithProducts {
  collection: CollectionEntity;
  products: ProductEntity[];
}

export abstract class ICollectionRepository {
  abstract list(): Promise<CollectionEntity[]>;
  abstract findBySlug(slug: string): Promise<CollectionWithProducts | null>;
  abstract findById(id: string): Promise<CollectionEntity | null>;
  abstract create(collection: CollectionEntity): Promise<void>;
  abstract addProduct(collectionId: string, productId: string, displayOrder?: number): Promise<void>;
  abstract removeProduct(collectionId: string, productId: string): Promise<void>;
}
