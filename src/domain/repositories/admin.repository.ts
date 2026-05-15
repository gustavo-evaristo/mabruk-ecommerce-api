import { AdminEntity } from '../entities/admin.entity';

export abstract class IAdminRepository {
  abstract get(id: string): Promise<AdminEntity | null>;
  abstract findByEmail(email: string): Promise<AdminEntity | null>;
  abstract create(admin: AdminEntity): Promise<void>;
  abstract update(admin: AdminEntity): Promise<void>;
  abstract countOwners(): Promise<number>;
}
