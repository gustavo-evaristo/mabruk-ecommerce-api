import { Injectable } from '@nestjs/common';
import { ICollectionRepository } from 'src/domain/repositories/collection.repository';
import { CollectionEntity } from 'src/domain/entities/collection.entity';

@Injectable()
export class ListCollectionsUseCase {
  constructor(private readonly collectionRepository: ICollectionRepository) {}

  async execute(onlyActive = true): Promise<CollectionEntity[]> {
    return this.collectionRepository.list({ onlyActive });
  }
}
