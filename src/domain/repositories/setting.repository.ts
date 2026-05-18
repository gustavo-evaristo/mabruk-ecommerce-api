import { SettingEntity } from '../entities/setting.entity';

export abstract class ISettingRepository {
  abstract listAll(): Promise<SettingEntity[]>;
  abstract listByGroup(group: string): Promise<SettingEntity[]>;
  abstract get(group: string, key: string): Promise<SettingEntity | null>;
  abstract upsert(setting: SettingEntity): Promise<void>;
  abstract delete(group: string, key: string): Promise<void>;
}
