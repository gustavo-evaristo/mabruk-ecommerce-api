import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { IBannerRepository } from 'src/domain/repositories/banner.repository';
import { BannerEntity } from 'src/domain/entities/banner.entity';
import { UUID } from 'src/domain/entities/vos';

@Injectable()
export class BannerRepository implements IBannerRepository {
  constructor(private readonly prisma: PrismaService) {}

  private toEntity(row: any): BannerEntity {
    return new BannerEntity({
      id: UUID.from(row.id),
      imageUrl: row.imageUrl,
      mobileImageUrl: row.mobileImageUrl,
      linkUrl: row.linkUrl,
      alt: row.alt,
      order: row.order,
      isActive: row.isActive,
      startsAt: row.startsAt,
      endsAt: row.endsAt,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    });
  }

  async list({ onlyVisible, now }: { onlyVisible?: boolean; now?: Date } = {}): Promise<BannerEntity[]> {
    const ref = now ?? new Date();
    const where: any = {};
    if (onlyVisible) {
      where.isActive = true;
      where.AND = [
        { OR: [{ startsAt: null }, { startsAt: { lte: ref } }] },
        { OR: [{ endsAt: null }, { endsAt: { gte: ref } }] },
      ];
    }
    const rows = await this.prisma.banners.findMany({
      where,
      orderBy: [{ order: 'asc' }, { createdAt: 'desc' }],
    });
    return rows.map((r) => this.toEntity(r));
  }

  async get(id: string): Promise<BannerEntity | null> {
    const row = await this.prisma.banners.findUnique({ where: { id } });
    return row ? this.toEntity(row) : null;
  }

  async create(b: BannerEntity): Promise<void> {
    await this.prisma.banners.create({
      data: {
        id: b.id.toString(),
        imageUrl: b.imageUrl,
        mobileImageUrl: b.mobileImageUrl,
        linkUrl: b.linkUrl,
        alt: b.alt,
        order: b.order,
        isActive: b.isActive,
        startsAt: b.startsAt,
        endsAt: b.endsAt,
        createdAt: b.createdAt,
        updatedAt: b.updatedAt,
      },
    });
  }

  async update(b: BannerEntity): Promise<void> {
    await this.prisma.banners.update({
      where: { id: b.id.toString() },
      data: {
        imageUrl: b.imageUrl,
        mobileImageUrl: b.mobileImageUrl,
        linkUrl: b.linkUrl,
        alt: b.alt,
        order: b.order,
        isActive: b.isActive,
        startsAt: b.startsAt,
        endsAt: b.endsAt,
        updatedAt: b.updatedAt,
      },
    });
  }

  async delete(id: string): Promise<void> {
    await this.prisma.banners.delete({ where: { id } });
  }
}
