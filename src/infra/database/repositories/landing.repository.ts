import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { ILandingRepository } from 'src/domain/repositories/landing.repository';
import { LandingEntity, LandingStatus, LandingBlock } from 'src/domain/entities/landing.entity';
import { UUID } from 'src/domain/entities/vos';

@Injectable()
export class LandingRepository implements ILandingRepository {
  constructor(private readonly prisma: PrismaService) {}

  private toEntity(row: any): LandingEntity {
    return new LandingEntity({
      id: UUID.from(row.id),
      slug: row.slug,
      name: row.name,
      blocks: (row.blocks as LandingBlock[]) ?? [],
      seoTitle: row.seoTitle,
      seoDescription: row.seoDescription,
      status: row.status as LandingStatus,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    });
  }

  async list(): Promise<LandingEntity[]> {
    const rows = await this.prisma.landings.findMany({ orderBy: { createdAt: 'desc' } });
    return rows.map((r) => this.toEntity(r));
  }

  async get(id: string): Promise<LandingEntity | null> {
    const row = await this.prisma.landings.findUnique({ where: { id } });
    return row ? this.toEntity(row) : null;
  }

  async findBySlug(slug: string): Promise<LandingEntity | null> {
    const row = await this.prisma.landings.findUnique({ where: { slug } });
    return row ? this.toEntity(row) : null;
  }

  async create(l: LandingEntity): Promise<void> {
    await this.prisma.landings.create({
      data: {
        id: l.id.toString(),
        slug: l.slug,
        name: l.name,
        blocks: l.blocks as never,
        seoTitle: l.seoTitle,
        seoDescription: l.seoDescription,
        status: l.status,
      },
    });
  }

  async update(l: LandingEntity): Promise<void> {
    await this.prisma.landings.update({
      where: { id: l.id.toString() },
      data: {
        slug: l.slug,
        name: l.name,
        blocks: l.blocks as never,
        seoTitle: l.seoTitle,
        seoDescription: l.seoDescription,
        status: l.status,
      },
    });
  }

  async delete(id: string): Promise<void> {
    await this.prisma.landings.delete({ where: { id } });
  }
}
