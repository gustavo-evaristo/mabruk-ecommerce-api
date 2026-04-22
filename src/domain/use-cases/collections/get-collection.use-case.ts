import { Injectable, NotFoundException } from '@nestjs/common';
import { ICollectionRepository, CollectionWithProducts } from '../../repositories/collection.repository';

@Injectable()
export class GetCollectionUseCase {
  constructor(private readonly collectionRepository: ICollectionRepository) {}

  async execute(slug: string): Promise<CollectionWithProducts> {
    const result = await this.collectionRepository.findBySlug(slug);

    if (!result) {
      throw new NotFoundException(`Collection not found: ${slug}`);
    }

    return result;
  }
}
