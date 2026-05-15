import { Injectable, NotFoundException } from '@nestjs/common';
import { ICollectionRepository } from 'src/domain/repositories/collection.repository';
import {
  IProductRepository,
  ProductListResult,
} from 'src/domain/repositories/product.repository';
import { CollectionEntity } from 'src/domain/entities/collection.entity';

interface Output {
  collection: CollectionEntity;
  products: ProductListResult;
}

@Injectable()
export class GetCollectionBySlugUseCase {
  constructor(
    private readonly collectionRepository: ICollectionRepository,
    private readonly productRepository: IProductRepository,
  ) {}

  async execute(slug: string, page = 1, pageSize = 20): Promise<Output> {
    const collection = await this.collectionRepository.findBySlug(slug);
    if (!collection || !collection.isActive) {
      throw new NotFoundException('Collection not found');
    }
    const products = await this.productRepository.list({
      status: 'ACTIVE',
      collectionSlug: slug,
      page,
      pageSize,
    });
    return { collection, products };
  }
}
