import { Module } from '@nestjs/common';
import { CollectionsController } from './collections.controller';
import { ListCollectionsUseCase } from '../../../domain/use-cases/collections/list-collections.use-case';
import { GetCollectionUseCase } from '../../../domain/use-cases/collections/get-collection.use-case';
import { CreateCollectionUseCase } from '../../../domain/use-cases/collections/create-collection.use-case';
import { DatabaseModule } from '../../database/database.module';

@Module({
  imports: [DatabaseModule],
  controllers: [CollectionsController],
  providers: [ListCollectionsUseCase, GetCollectionUseCase, CreateCollectionUseCase],
})
export class CollectionsModule {}
