import { Injectable } from '@nestjs/common';
import { ISettingRepository } from 'src/domain/repositories/setting.repository';
import { SettingEntity } from 'src/domain/entities/setting.entity';

@Injectable()
export class GetAllSettingsUseCase {
  constructor(private readonly repo: ISettingRepository) {}

  async execute(): Promise<Record<string, Record<string, unknown>>> {
    const items = await this.repo.listAll();
    const out: Record<string, Record<string, unknown>> = {};
    for (const s of items) {
      if (!out[s.group]) out[s.group] = {};
      out[s.group][s.key] = s.value;
    }
    return out;
  }
}

@Injectable()
export class GetSettingsByGroupUseCase {
  constructor(private readonly repo: ISettingRepository) {}

  async execute(group: string): Promise<Record<string, unknown>> {
    const items = await this.repo.listByGroup(group);
    const out: Record<string, unknown> = {};
    for (const s of items) out[s.key] = s.value;
    return out;
  }
}

interface UpsertSettingInput {
  group: string;
  key: string;
  value: unknown;
}

@Injectable()
export class UpsertSettingUseCase {
  constructor(private readonly repo: ISettingRepository) {}

  async execute(input: UpsertSettingInput): Promise<void> {
    await this.repo.upsert(
      new SettingEntity({
        group: input.group,
        key: input.key,
        value: input.value,
      }),
    );
  }
}

@Injectable()
export class UpsertManySettingsUseCase {
  constructor(private readonly repo: ISettingRepository) {}

  async execute(group: string, values: Record<string, unknown>): Promise<void> {
    for (const [key, value] of Object.entries(values)) {
      await this.repo.upsert(new SettingEntity({ group, key, value }));
    }
  }
}
