import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { IPromotionRepository } from 'src/domain/repositories/promotion.repository';
import {
  DiscountType,
  PromotionEntity,
  PromotionStatus,
  PromotionType,
} from 'src/domain/entities/promotion.entity';
import { UUID } from 'src/domain/entities/vos';

@Injectable()
export class PromotionRepository implements IPromotionRepository {
  constructor(private readonly prisma: PrismaService) {}

  private toEntity(row: any): PromotionEntity {
    return new PromotionEntity({
      id: UUID.from(row.id),
      type: row.type as PromotionType,
      name: row.name,
      code: row.code,
      description: row.description,
      discountType: row.discountType as DiscountType,
      discountValue: row.discountValue,
      scope: row.scope,
      usesMax: row.usesMax,
      usesCount: row.usesCount,
      startsAt: row.startsAt,
      expiresAt: row.expiresAt,
      status: row.status as PromotionStatus,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    });
  }

  async list(filters?: { type?: PromotionType }): Promise<PromotionEntity[]> {
    const rows = await this.prisma.promotions.findMany({
      where: filters?.type ? { type: filters.type } : undefined,
      orderBy: { createdAt: 'desc' },
    });
    return rows.map((r) => this.toEntity(r));
  }

  async get(id: string): Promise<PromotionEntity | null> {
    const row = await this.prisma.promotions.findUnique({ where: { id } });
    return row ? this.toEntity(row) : null;
  }

  async findByCode(code: string): Promise<PromotionEntity | null> {
    const row = await this.prisma.promotions.findFirst({
      where: { code: { equals: code, mode: 'insensitive' } },
    });
    return row ? this.toEntity(row) : null;
  }

  async create(p: PromotionEntity): Promise<void> {
    await this.prisma.promotions.create({
      data: {
        id: p.id.toString(),
        type: p.type,
        name: p.name,
        code: p.code,
        description: p.description,
        discountType: p.discountType,
        discountValue: p.discountValue,
        scope: p.scope,
        usesMax: p.usesMax,
        usesCount: p.usesCount,
        startsAt: p.startsAt,
        expiresAt: p.expiresAt,
        status: p.status,
      },
    });
  }

  async update(p: PromotionEntity): Promise<void> {
    await this.prisma.promotions.update({
      where: { id: p.id.toString() },
      data: {
        type: p.type,
        name: p.name,
        code: p.code,
        description: p.description,
        discountType: p.discountType,
        discountValue: p.discountValue,
        scope: p.scope,
        usesMax: p.usesMax,
        startsAt: p.startsAt,
        expiresAt: p.expiresAt,
        status: p.status,
      },
    });
  }

  async delete(id: string): Promise<void> {
    await this.prisma.promotions.delete({ where: { id } });
  }

  async incrementUses(id: string): Promise<void> {
    await this.prisma.promotions.update({
      where: { id },
      data: { usesCount: { increment: 1 } },
    });
  }
}
