import { ProductEntity } from '../entities/product.entity';

export interface ListProductsFilters {
  categoryId?: string;
  subcategoryId?: string;
  platingType?: string;
  isFeatured?: boolean;
  isRecommended?: boolean;
  isFavorite?: boolean;
  isActive?: boolean;
  search?: string;
  page?: number;
  limit?: number;
}

export interface ListProductsResult {
  products: ProductEntity[];
  total: number;
}

export abstract class IProductRepository {
  abstract list(filters: ListProductsFilters): Promise<ListProductsResult>;
  abstract findById(id: string): Promise<ProductEntity | null>;
  abstract findBySlug(slug: string): Promise<ProductEntity | null>;
  abstract findByJueriId(jueriId: number): Promise<ProductEntity | null>;
  abstract upsert(product: ProductEntity): Promise<void>;
  abstract updateFlags(
    id: string,
    flags: Partial<Pick<ProductEntity, 'isFeatured' | 'isRecommended' | 'isFavorite' | 'displayOrder'>>,
  ): Promise<void>;
  abstract deactivateByJueriIds(activeJueriIds: number[]): Promise<number>;
}
