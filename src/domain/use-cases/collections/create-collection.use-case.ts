import { Injectable, ConflictException } from '@nestjs/common';
import { ICollectionRepository } from '../../repositories/collection.repository';
import { CollectionEntity } from '../../entities/collection.entity';

interface Input {
  name: string;
  slug: string;
  description?: string;
  coverImage?: string;
}

@Injectable()
export class CreateCollectionUseCase {
  constructor(private readonly collectionRepository: ICollectionRepository) {}

  async execute(input: Input): Promise<CollectionEntity> {
    const existing = await this.collectionRepository.findBySlug(input.slug);

    if (existing) {
      throw new ConflictException(`Collection with slug "${input.slug}" already exists`);
    }

    const collection = new CollectionEntity({
      name: input.name,
      slug: input.slug,
      description: input.description,
      coverImage: input.coverImage,
    });

    await this.collectionRepository.create(collection);

    return collection;
  }
}
