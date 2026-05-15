import { Injectable, NotFoundException } from '@nestjs/common';
import { IProductRepository } from 'src/domain/repositories/product.repository';

@Injectable()
export class DeleteProductUseCase {
  constructor(private readonly productRepository: IProductRepository) {}

  async execute(id: string): Promise<void> {
    const product = await this.productRepository.get(id);
    if (!product) throw new NotFoundException('Product not found');
    product.archive();
    await this.productRepository.update(product);
  }
}
