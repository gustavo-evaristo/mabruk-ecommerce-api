import { Injectable } from '@nestjs/common';
import {
  IProductRepository,
  ProductListResult,
} from 'src/domain/repositories/product.repository';
import { ProductStatus } from 'src/domain/entities/product.entity';

interface Input {
  search?: string;
  status?: ProductStatus;
  categoryId?: string;
  page?: number;
  pageSize?: number;
}

@Injectable()
export class ListProductsAdminUseCase {
  constructor(private readonly productRepository: IProductRepository) {}

  async execute(input: Input): Promise<ProductListResult> {
    return this.productRepository.list({
      ...input,
      pageSize: Math.min(input.pageSize ?? 30, 100),
    });
  }
}
