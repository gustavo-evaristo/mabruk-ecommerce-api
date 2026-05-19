import { Module } from '@nestjs/common';
import { CatalogModule } from '../controllers/catalog.module';
import { TrashCleanupJob } from './trash-cleanup.job';

@Module({
  imports: [CatalogModule],
  providers: [TrashCleanupJob],
})
export class JobsModule {}
