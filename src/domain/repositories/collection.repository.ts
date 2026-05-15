import { CollectionEntity } from '../entities/collection.entity';

export interface CollectionProductRef {
  productId: string;
  order: number;
}

export abstract class ICollectionRepository {
  abstract list(input?: { onlyActive?: boolean }): Promise<CollectionEntity[]>;
  abstract get(id: string): Promise<CollectionEntity | null>;
  abstract findBySlug(slug: string): Promise<CollectionEntity | null>;
  abstract create(collection: CollectionEntity): Promise<void>;
  abstract update(collection: CollectionEntity): Promise<void>;
  abstract delete(id: string): Promise<void>;
  abstract setProducts(collectionId: string, products: CollectionProductRef[]): Promise<void>;
  abstract listProductIds(collectionId: string): Promise<string[]>;
}
