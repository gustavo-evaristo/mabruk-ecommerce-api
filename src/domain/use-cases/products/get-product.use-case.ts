import { Injectable, NotFoundException } from '@nestjs/common';
import { IProductRepository } from '../../repositories/product.repository';
import { ProductEntity } from '../../entities/product.entity';

@Injectable()
export class GetProductUseCase {
  constructor(private readonly productRepository: IProductRepository) {}

  async execute(slug: string): Promise<ProductEntity> {
    const product = await this.productRepository.findBySlug(slug);

    if (!product) {
      throw new NotFoundException(`Product not found: ${slug}`);
    }

    return product;
  }
}
