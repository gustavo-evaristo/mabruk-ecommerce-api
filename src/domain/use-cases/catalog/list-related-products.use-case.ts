import { Injectable, NotFoundException } from '@nestjs/common';
import {
  IProductRepository,
  ProductListItem,
} from 'src/domain/repositories/product.repository';

@Injectable()
export class ListRelatedProductsUseCase {
  constructor(private readonly productRepository: IProductRepository) {}

  async execute(slug: string, limit = 8): Promise<ProductListItem[]> {
    const product = await this.productRepository.findBySlug(slug);
    if (!product) throw new NotFoundException('Product not found');
    return this.productRepository.listRelated(product.id.toString(), limit);
  }
}
