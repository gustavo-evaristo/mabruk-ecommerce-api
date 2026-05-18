import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { ISettingRepository } from 'src/domain/repositories/setting.repository';
import { SettingEntity } from 'src/domain/entities/setting.entity';

@Injectable()
export class SettingRepository implements ISettingRepository {
  constructor(private readonly prisma: PrismaService) {}

  private toEntity(row: any): SettingEntity {
    return new SettingEntity({
      group: row.group,
      key: row.key,
      value: row.value,
      updatedAt: row.updatedAt,
    });
  }

  async listAll(): Promise<SettingEntity[]> {
    const rows = await this.prisma.settings.findMany({
      orderBy: [{ group: 'asc' }, { key: 'asc' }],
    });
    return rows.map((r) => this.toEntity(r));
  }

  async listByGroup(group: string): Promise<SettingEntity[]> {
    const rows = await this.prisma.settings.findMany({
      where: { group },
      orderBy: { key: 'asc' },
    });
    return rows.map((r) => this.toEntity(r));
  }

  async get(group: string, key: string): Promise<SettingEntity | null> {
    const row = await this.prisma.settings.findUnique({
      where: { group_key: { group, key } },
    });
    return row ? this.toEntity(row) : null;
  }

  async upsert(setting: SettingEntity): Promise<void> {
    await this.prisma.settings.upsert({
      where: { group_key: { group: setting.group, key: setting.key } },
      create: {
        group: setting.group,
        key: setting.key,
        value: setting.value as never,
      },
      update: { value: setting.value as never },
    });
  }

  async delete(group: string, key: string): Promise<void> {
    await this.prisma.settings.delete({
      where: { group_key: { group, key } },
    });
  }
}
