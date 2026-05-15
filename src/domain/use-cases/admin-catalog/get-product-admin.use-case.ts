import { Injectable, NotFoundException } from '@nestjs/common';
import {
  IProductRepository,
  ProductDetails,
} from 'src/domain/repositories/product.repository';

@Injectable()
export class GetProductAdminUseCase {
  constructor(private readonly productRepository: IProductRepository) {}

  async execute(id: string): Promise<ProductDetails> {
    const details = await this.productRepository.getDetails(id);
    if (!details) throw new NotFoundException('Product not found');
    return details;
  }
}
