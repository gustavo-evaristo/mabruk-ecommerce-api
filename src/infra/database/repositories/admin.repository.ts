import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { IAdminRepository } from 'src/domain/repositories/admin.repository';
import { AdminEntity, AdminRole } from 'src/domain/entities/admin.entity';
import { Password, UUID } from 'src/domain/entities/vos';

@Injectable()
export class AdminRepository implements IAdminRepository {
  constructor(private readonly prisma: PrismaService) {}

  private toEntity(row: any): AdminEntity {
    return new AdminEntity({
      id: UUID.from(row.id),
      name: row.name,
      email: row.email,
      password: Password.fromHash(row.password),
      role: row.role as AdminRole,
      isActive: row.isActive,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    });
  }

  async get(id: string): Promise<AdminEntity | null> {
    const row = await this.prisma.admins.findUnique({ where: { id, isActive: true } });
    return row ? this.toEntity(row) : null;
  }

  async findByEmail(email: string): Promise<AdminEntity | null> {
    const row = await this.prisma.admins.findUnique({
      where: { email: email.toLowerCase(), isActive: true },
    });
    return row ? this.toEntity(row) : null;
  }

  async create(a: AdminEntity): Promise<void> {
    await this.prisma.admins.create({
      data: {
        id: a.id.toString(),
        name: a.name,
        email: a.email.toLowerCase(),
        password: a.password.hash(),
        role: a.role,
        isActive: a.isActive,
        createdAt: a.createdAt,
        updatedAt: a.updatedAt,
      },
    });
  }

  async update(a: AdminEntity): Promise<void> {
    await this.prisma.admins.update({
      where: { id: a.id.toString() },
      data: {
        name: a.name,
        email: a.email.toLowerCase(),
        password: a.password.hash(),
        role: a.role,
        isActive: a.isActive,
        updatedAt: a.updatedAt,
      },
    });
  }

  async countOwners(): Promise<number> {
    return this.prisma.admins.count({ where: { role: 'OWNER', isActive: true } });
  }
}
