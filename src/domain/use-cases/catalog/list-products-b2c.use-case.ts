import { Injectable } from '@nestjs/common';
import {
  IProductRepository,
  ProductListFilters,
  ProductListResult,
} from 'src/domain/repositories/product.repository';

export interface ListProductsB2CInput {
  search?: string;
  categorySlug?: string;
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

@Injectable()
export class ListProductsB2CUseCase {
  constructor(private readonly productRepository: IProductRepository) {}

  async execute(input: ListProductsB2CInput): Promise<ProductListResult> {
    const filters: ProductListFilters = {
      ...input,
      status: 'ACTIVE',
      pageSize: Math.min(input.pageSize ?? 20, 60),
    };
    return this.productRepository.list(filters);
  }
}
