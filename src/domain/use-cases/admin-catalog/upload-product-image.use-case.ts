import { Injectable, NotFoundException } from '@nestjs/common';
import { IProductImageRepository } from 'src/domain/repositories/product-image.repository';
import { IProductRepository } from 'src/domain/repositories/product.repository';
import { ImageStorage } from 'src/domain/services/image-storage';
import { ProductImageEntity } from 'src/domain/entities/product-image.entity';

interface Input {
  productId: string;
  variantId?: string | null;
  buffer: Buffer;
  mimeType: string;
  originalName: string;
  alt?: string;
}

@Injectable()
export class UploadProductImageUseCase {
  constructor(
    private readonly imageRepository: IProductImageRepository,
    private readonly productRepository: IProductRepository,
    private readonly storage: ImageStorage,
  ) {}

  async execute(input: Input): Promise<ProductImageEntity> {
    const product = await this.productRepository.get(input.productId);
    if (!product) throw new NotFoundException('Product not found');

    const upload = await this.storage.upload({
      buffer: input.buffer,
      mimeType: input.mimeType,
      fileName: input.originalName,
      folder: `products/${input.productId}`,
    });

    const existing = await this.imageRepository.listByProductId(input.productId);
    const nextOrder = existing.length;

    const image = new ProductImageEntity({
      productId: input.productId,
      variantId: input.variantId ?? null,
      url: upload.url,
      alt: input.alt,
      order: nextOrder,
    });

    await this.imageRepository.create(image);
    return image;
  }
}
