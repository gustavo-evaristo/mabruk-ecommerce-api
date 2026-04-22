import { Injectable } from '@nestjs/common';
import { ICollectionRepository } from '../../repositories/collection.repository';
import { CollectionEntity } from '../../entities/collection.entity';

@Injectable()
export class ListCollectionsUseCase {
  constructor(private readonly collectionRepository: ICollectionRepository) {}

  async execute(): Promise<CollectionEntity[]> {
    return this.collectionRepository.list();
  }
}
