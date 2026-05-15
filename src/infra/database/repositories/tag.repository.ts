import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { ITagRepository } from 'src/domain/repositories/tag.repository';
import { TagEntity } from 'src/domain/entities/tag.entity';
import { UUID } from 'src/domain/entities/vos';

@Injectable()
export class TagRepository implements ITagRepository {
  constructor(private readonly prisma: PrismaService) {}

  private toEntity(row: any): TagEntity {
    return new TagEntity({
      id: UUID.from(row.id),
      slug: row.slug,
      name: row.name,
      createdAt: row.createdAt,
    });
  }

  async list(): Promise<TagEntity[]> {
    const rows = await this.prisma.tags.findMany({ orderBy: { name: 'asc' } });
    return rows.map((r) => this.toEntity(r));
  }

  async get(id: string): Promise<TagEntity | null> {
    const row = await this.prisma.tags.findUnique({ where: { id } });
    return row ? this.toEntity(row) : null;
  }

  async findBySlug(slug: string): Promise<TagEntity | null> {
    const row = await this.prisma.tags.findUnique({ where: { slug } });
    return row ? this.toEntity(row) : null;
  }

  async create(t: TagEntity): Promise<void> {
    await this.prisma.tags.create({
      data: {
        id: t.id.toString(),
        slug: t.slug,
        name: t.name,
        createdAt: t.createdAt,
      },
    });
  }

  async update(t: TagEntity): Promise<void> {
    await this.prisma.tags.update({
      where: { id: t.id.toString() },
      data: { slug: t.slug, name: t.name },
    });
  }

  async delete(id: string): Promise<void> {
    await this.prisma.tags.delete({ where: { id } });
  }

  async syncProductTags(productId: string, tagIds: string[]): Promise<void> {
    await this.prisma.$transaction([
      this.prisma.product_tags.deleteMany({ where: { productId } }),
      this.prisma.product_tags.createMany({
        data: tagIds.map((tagId) => ({ productId, tagId })),
        skipDuplicates: true,
      }),
    ]);
  }

  async listProductTags(productId: string): Promise<TagEntity[]> {
    const rows = await this.prisma.product_tags.findMany({
      where: { productId },
      include: { tag: true },
    });
    return rows.map((r) => this.toEntity(r.tag));
  }
}
