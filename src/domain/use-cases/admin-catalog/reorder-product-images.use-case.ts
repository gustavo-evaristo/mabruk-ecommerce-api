import { Injectable } from '@nestjs/common';
import { IProductImageRepository } from 'src/domain/repositories/product-image.repository';

@Injectable()
export class ReorderProductImagesUseCase {
  constructor(private readonly imageRepository: IProductImageRepository) {}

  async execute(productId: string, orderedIds: string[]): Promise<void> {
    await this.imageRepository.reorder(productId, orderedIds);
  }
}
