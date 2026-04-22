import { Injectable, NotFoundException } from '@nestjs/common';
import { IProductRepository } from '../../repositories/product.repository';
import { ProductEntity } from '../../entities/product.entity';

interface Input {
  id: string;
  isFeatured?: boolean;
  isRecommended?: boolean;
  isFavorite?: boolean;
  displayOrder?: number;
}

@Injectable()
export class UpdateProductFlagsUseCase {
  constructor(private readonly productRepository: IProductRepository) {}

  async execute(input: Input): Promise<void> {
    const product = await this.productRepository.findById(input.id);

    if (!product) {
      throw new NotFoundException(`Product not found: ${input.id}`);
    }

    await this.productRepository.updateFlags(input.id, {
      isFeatured: input.isFeatured,
      isRecommended: input.isRecommended,
      isFavorite: input.isFavorite,
      displayOrder: input.displayOrder,
    });
  }
}
