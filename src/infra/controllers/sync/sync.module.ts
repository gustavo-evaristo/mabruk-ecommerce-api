import { Module } from '@nestjs/common';
import { SyncController } from './sync.controller';
import { SyncCatalogUseCase } from '../../../domain/use-cases/sync/sync-catalog.use-case';
import { DatabaseModule } from '../../database/database.module';

@Module({
  imports: [DatabaseModule],
  controllers: [SyncController],
  providers: [SyncCatalogUseCase],
})
export class SyncModule {}
