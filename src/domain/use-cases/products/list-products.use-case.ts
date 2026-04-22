import { Injectable } from '@nestjs/common';
import { IProductRepository, ListProductsFilters, ListProductsResult } from '../../repositories/product.repository';

@Injectable()
export class ListProductsUseCase {
  constructor(private readonly productRepository: IProductRepository) {}

  async execute(filters: ListProductsFilters): Promise<ListProductsResult> {
    return this.productRepository.list({
      ...filters,
      isActive: filters.isActive ?? true,
      limit: filters.limit ?? 24,
      page: filters.page ?? 1,
    });
  }
}
