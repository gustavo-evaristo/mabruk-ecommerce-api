import { Injectable } from '@nestjs/common';
import { ISyncLogRepository, CreateSyncLogInput } from '../../../domain/repositories/sync-log.repository';
import { PrismaService } from '../prisma.service';

@Injectable()
export class PrismaSyncLogRepository implements ISyncLogRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(input: CreateSyncLogInput): Promise<void> {
    await this.prisma.db.sync_logs.create({
      data: {
        type: input.type,
        direction: input.direction,
        status: input.status,
        items_affected: input.itemsAffected ?? 0,
        error_message: input.errorMessage,
        payload: input.payload as any,
      },
    });
  }

  async findLatestByType(type: string): Promise<{ createdAt: Date } | null> {
    const row = await this.prisma.db.sync_logs.findFirst({
      where: { type, status: 'success' },
      orderBy: { created_at: 'desc' },
      select: { created_at: true },
    });

    return row ? { createdAt: row.created_at } : null;
  }
}
