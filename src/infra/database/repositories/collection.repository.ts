import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import {
  CollectionProductRef,
  ICollectionRepository,
} from 'src/domain/repositories/collection.repository';
import { CollectionEntity } from 'src/domain/entities/collection.entity';
import { UUID } from 'src/domain/entities/vos';

@Injectable()
export class CollectionRepository implements ICollectionRepository {
  constructor(private readonly prisma: PrismaService) {}

  private toEntity(row: any): CollectionEntity {
    return new CollectionEntity({
      id: UUID.from(row.id),
      slug: row.slug,
      name: row.name,
      description: row.description,
      coverImageUrl: row.coverImageUrl,
      order: row.order,
      isActive: row.isActive,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    });
  }

  async list({ onlyActive }: { onlyActive?: boolean } = {}): Promise<CollectionEntity[]> {
    const rows = await this.prisma.collections.findMany({
      where: onlyActive ? { isActive: true } : undefined,
      orderBy: [{ order: 'asc' }, { name: 'asc' }],
    });
    return rows.map((r) => this.toEntity(r));
  }

  async get(id: string): Promise<CollectionEntity | null> {
    const row = await this.prisma.collections.findUnique({ where: { id } });
    return row ? this.toEntity(row) : null;
  }

  async findBySlug(slug: string): Promise<CollectionEntity | null> {
    const row = await this.prisma.collections.findUnique({ where: { slug } });
    return row ? this.toEntity(row) : null;
  }

  async create(c: CollectionEntity): Promise<void> {
    await this.prisma.collections.create({
      data: {
        id: c.id.toString(),
        slug: c.slug,
        name: c.name,
        description: c.description,
        coverImageUrl: c.coverImageUrl,
        order: c.order,
        isActive: c.isActive,
        createdAt: c.createdAt,
        updatedAt: c.updatedAt,
      },
    });
  }

  async update(c: CollectionEntity): Promise<void> {
    await this.prisma.collections.update({
      where: { id: c.id.toString() },
      data: {
        slug: c.slug,
        name: c.name,
        description: c.description,
        coverImageUrl: c.coverImageUrl,
        order: c.order,
        isActive: c.isActive,
        updatedAt: c.updatedAt,
      },
    });
  }

  async delete(id: string): Promise<void> {
    await this.prisma.collections.delete({ where: { id } });
  }

  async setProducts(collectionId: string, products: CollectionProductRef[]): Promise<void> {
    await this.prisma.$transaction([
      this.prisma.collection_products.deleteMany({ where: { collectionId } }),
      this.prisma.collection_products.createMany({
        data: products.map((p) => ({
          collectionId,
          productId: p.productId,
          order: p.order,
        })),
        skipDuplicates: true,
      }),
    ]);
  }

  async listProductIds(collectionId: string): Promise<string[]> {
    const rows = await this.prisma.collection_products.findMany({
      where: { collectionId },
      orderBy: { order: 'asc' },
      select: { productId: true },
    });
    return rows.map((r) => r.productId);
  }
}
