import { Controller, Post, Get } from '@nestjs/common';
import { SyncCatalogUseCase } from '../../../domain/use-cases/sync/sync-catalog.use-case';
import { ISyncLogRepository } from '../../../domain/repositories/sync-log.repository';

@Controller('admin/sync')
export class SyncController {
  constructor(
    private readonly syncCatalog: SyncCatalogUseCase,
    private readonly syncLogRepository: ISyncLogRepository,
  ) {}

  @Post('trigger')
  async trigger() {
    const result = await this.syncCatalog.execute();
    return { ok: true, result };
  }

  @Get('status')
  async status() {
    const lastSync = await this.syncLogRepository.findLatestByType('PRODUCT_PULL');
    return { lastSyncAt: lastSync?.createdAt ?? null };
  }
}
