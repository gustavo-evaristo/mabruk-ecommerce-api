import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { CleanupExpiredDeletedProductsUseCase } from 'src/domain/use-cases/admin-catalog';

/**
 * Job diário que faz hard-delete de produtos na lixeira há mais de 30 dias.
 * Roda todo dia às 03:00 (horário do servidor).
 */
@Injectable()
export class TrashCleanupJob {
  private readonly logger = new Logger(TrashCleanupJob.name);

  constructor(private readonly cleanup: CleanupExpiredDeletedProductsUseCase) {}

  @Cron(CronExpression.EVERY_DAY_AT_3AM)
  async handleCron() {
    try {
      const count = await this.cleanup.execute();
      if (count > 0) {
        this.logger.log(`Limpeza diária da lixeira: ${count} produto(s) hard-deleted.`);
      }
    } catch (err) {
      this.logger.error('Falha na limpeza da lixeira de produtos', err as Error);
    }
  }
}
