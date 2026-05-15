import { ProductEntity, ProductStatus } from '../entities/product.entity';
import { ProductVariantEntity } from '../entities/product-variant.entity';
import { ProductImageEntity } from '../entities/product-image.entity';

export interface ProductListFilters {
  search?: string;
  status?: ProductStatus | ProductStatus[];
  categorySlug?: string;
  categoryId?: string;
  collectionSlug?: string;
  tagSlug?: string;
  banho?: string;
  minPriceCents?: number;
  maxPriceCents?: number;
  inStock?: boolean;
  page?: number;
  pageSize?: number;
  sort?: 'newest' | 'price_asc' | 'price_desc' | 'name_asc';
}

export interface ProductListItem {
  product: ProductEntity;
  variants: ProductVariantEntity[];
  images: ProductImageEntity[];
  categorySlug: string;
  categoryName: string;
}

export interface ProductDetails {
  product: ProductEntity;
  variants: ProductVariantEntity[];
  images: ProductImageEntity[];
  categorySlug: string;
  categoryName: string;
  tags: { id: string; slug: string; name: string }[];
}

export interface ProductListResult {
  items: ProductListItem[];
  total: number;
  page: number;
  pageSize: number;
}

export abstract class IProductRepository {
  abstract list(filters: ProductListFilters): Promise<ProductListResult>;
  abstract get(id: string): Promise<ProductEntity | null>;
  abstract findBySlug(slug: string): Promise<ProductEntity | null>;
  abstract getDetails(slugOrId: string): Promise<ProductDetails | null>;
  abstract create(product: ProductEntity): Promise<void>;
  abstract update(product: ProductEntity): Promise<void>;
  abstract delete(id: string): Promise<void>;
  abstract listRelated(productId: string, limit: number): Promise<ProductListItem[]>;
  abstract listFeatured(limit: number): Promise<ProductListItem[]>;
}
