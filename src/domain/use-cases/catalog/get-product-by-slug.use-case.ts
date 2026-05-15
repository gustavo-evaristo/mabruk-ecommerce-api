import { Injectable, NotFoundException } from '@nestjs/common';
import {
  IProductRepository,
  ProductDetails,
} from 'src/domain/repositories/product.repository';

@Injectable()
export class GetProductBySlugUseCase {
  constructor(private readonly productRepository: IProductRepository) {}

  async execute(slug: string): Promise<ProductDetails> {
    const details = await this.productRepository.getDetails(slug);
    if (!details || details.product.status !== 'ACTIVE') {
      throw new NotFoundException('Product not found');
    }
    return details;
  }
}
