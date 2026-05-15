import { Injectable } from '@nestjs/common';
import {
  IProductRepository,
  ProductListItem,
} from 'src/domain/repositories/product.repository';

@Injectable()
export class ListFeaturedProductsUseCase {
  constructor(private readonly productRepository: IProductRepository) {}

  async execute(limit = 8): Promise<ProductListItem[]> {
    return this.productRepository.listFeatured(limit);
  }
}
