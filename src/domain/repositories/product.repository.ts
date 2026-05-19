import { ProductEntity, ProductStatus } from '../entities/product.entity';
import { ProductVariantEntity } from '../entities/product-variant.entity';
import { ProductImageEntity } from '../entities/product-image.entity';
import { VariantAttributeValue } from './product-variant.repository';

export interface ProductListFilters {
  search?: string;
  status?: ProductStatus | ProductStatus[];
  categorySlug?: string;
  categoryId?: string;
  collectionSlug?: string;
  tagSlug?: string;
  /** Filtros dinâmicos por atributo: { 'cor': ['azul', 'vermelho'], 'banho': ['ouro-18k'] } */
  attributeFilters?: Record<string, string[]>;
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
  variantValues: Record<string, VariantAttributeValue[]>;
  images: ProductImageEntity[];
  categorySlug: string;
  categoryName: string;
}

export interface ProductAttributeDefinition {
  id: string;
  slug: string;
  name: string;
  type: 'SELECT' | 'COLOR';
  order: number;
  values: { id: string; slug: string; name: string; hex: string | null; order: number }[];
}

export interface ProductDetails {
  product: ProductEntity;
  attributes: ProductAttributeDefinition[];
  variants: ProductVariantEntity[];
  variantValues: Record<string, VariantAttributeValue[]>;
  images: ProductImageEntity[];
  categorySlug: string;
  categoryName: string;
  tags: { id: string; slug: string; name: string }[];
}

export interface ProductListResult {
  items: ProductListItem[];
  /** Atributos disponíveis dentro do filtro atual (sidebar do PLP). */
  availableAttributes: AvailableAttribute[];
  total: number;
  page: number;
  pageSize: number;
}

export interface AvailableAttribute {
  slug: string;
  name: string;
  type: 'SELECT' | 'COLOR';
  values: { slug: string; name: string; hex: string | null; count: number }[];
}

export abstract class IProductRepository {
  abstract list(filters: ProductListFilters): Promise<ProductListResult>;
  abstract get(id: string): Promise<ProductEntity | null>;
  abstract findBySlug(slug: string): Promise<ProductEntity | null>;
  abstract getDetails(slugOrId: string): Promise<ProductDetails | null>;
  abstract create(product: ProductEntity, attributeIds: string[]): Promise<void>;
  /** Atualiza produto. Se `attributeIds` for passado, substitui completamente os atributos linkados (só pra VARIABLE). */
  abstract update(product: ProductEntity, attributeIds?: string[]): Promise<void>;
  /** Soft delete: marca deletedAt mas mantém no banco. */
  abstract delete(id: string): Promise<void>;
  abstract restore(id: string): Promise<void>;
  /** Hard delete: apaga linha permanentemente. */
  abstract hardDelete(id: string): Promise<void>;
  abstract listDeleted(): Promise<ProductListItem[]>;
  /** Hard delete em lote de produtos com deletedAt antes da data. Usado pelo cron. */
  abstract hardDeleteExpired(olderThan: Date): Promise<number>;
  abstract listRelated(productId: string, limit: number): Promise<ProductListItem[]>;
  abstract listFeatured(limit: number): Promise<ProductListItem[]>;
  /** Lista dos attributeIds vinculados a um produto, na ordem definida. */
  abstract listAttributeIds(productId: string): Promise<string[]>;
}
