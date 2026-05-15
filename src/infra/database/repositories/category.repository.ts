import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { ICategoryRepository } from 'src/domain/repositories/category.repository';
import { CategoryEntity } from 'src/domain/entities/category.entity';
import { UUID } from 'src/domain/entities/vos';

@Injectable()
export class CategoryRepository implements ICategoryRepository {
  constructor(private readonly prisma: PrismaService) {}

  private toEntity(row: any): CategoryEntity {
    return new CategoryEntity({
      id: UUID.from(row.id),
      slug: row.slug,
      name: row.name,
      order: row.order,
      isActive: row.isActive,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    });
  }

  async list({ onlyActive }: { onlyActive?: boolean } = {}): Promise<CategoryEntity[]> {
    const rows = await this.prisma.categories.findMany({
      where: onlyActive ? { isActive: true } : undefined,
      orderBy: [{ order: 'asc' }, { name: 'asc' }],
    });
    return rows.map((r) => this.toEntity(r));
  }

  async get(id: string): Promise<CategoryEntity | null> {
    const row = await this.prisma.categories.findUnique({ where: { id } });
    return row ? this.toEntity(row) : null;
  }

  async findBySlug(slug: string): Promise<CategoryEntity | null> {
    const row = await this.prisma.categories.findUnique({ where: { slug } });
    return row ? this.toEntity(row) : null;
  }

  async create(c: CategoryEntity): Promise<void> {
    await this.prisma.categories.create({
      data: {
        id: c.id.toString(),
        slug: c.slug,
        name: c.name,
        order: c.order,
        isActive: c.isActive,
        createdAt: c.createdAt,
        updatedAt: c.updatedAt,
      },
    });
  }

  async update(c: CategoryEntity): Promise<void> {
    await this.prisma.categories.update({
      where: { id: c.id.toString() },
      data: {
        slug: c.slug,
        name: c.name,
        order: c.order,
        isActive: c.isActive,
        updatedAt: c.updatedAt,
      },
    });
  }

  async delete(id: string): Promise<void> {
    await this.prisma.categories.delete({ where: { id } });
  }
}
