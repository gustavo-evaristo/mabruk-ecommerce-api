import { Injectable, NotFoundException } from '@nestjs/common';
import { IProductImageRepository } from 'src/domain/repositories/product-image.repository';
import { ImageStorage } from 'src/domain/services/image-storage';

@Injectable()
export class DeleteProductImageUseCase {
  constructor(
    private readonly imageRepository: IProductImageRepository,
    private readonly storage: ImageStorage,
  ) {}

  async execute(id: string): Promise<void> {
    const img = await this.imageRepository.get(id);
    if (!img) throw new NotFoundException('Image not found');
    await this.imageRepository.delete(id);
    try {
      await this.storage.delete(img.url);
    } catch {
      /* ok */
    }
  }
}
