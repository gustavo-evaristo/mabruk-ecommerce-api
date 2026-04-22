import { Injectable } from '@nestjs/common';
import { ICategoryRepository } from '../../../domain/repositories/category.repository';
import { CategoryEntity } from '../../../domain/entities/category.entity';
import { PrismaService } from '../prisma.service';

@Injectable()
export class PrismaCategoryRepository implements ICategoryRepository {
  constructor(private readonly prisma: PrismaService) {}

  async list(): Promise<CategoryEntity[]> {
    const rows = await this.prisma.db.categories.findMany({ orderBy: { name: 'asc' } });
    return rows.map(toEntity);
  }

  async findById(id: string): Promise<CategoryEntity | null> {
    const row = await this.prisma.db.categories.findUnique({ where: { id } });
    return row ? toEntity(row) : null;
  }

  async findByJueriId(jueriId: number): Promise<CategoryEntity | null> {
    const row = await this.prisma.db.categories.findUnique({ where: { jueri_id: jueriId } });
    return row ? toEntity(row) : null;
  }

  async upsert(category: CategoryEntity): Promise<CategoryEntity> {
    const data = {
      jueri_id: category.jueriId,
      name: category.name,
      slug: category.slug,
    };

    const row = await this.prisma.db.categories.upsert({
      where: { jueri_id: category.jueriId },
      create: { id: category.id.toString(), ...data },
      update: data,
    });

    return toEntity(row);
  }
}

function toEntity(row: any): CategoryEntity {
  return new CategoryEntity({
    id: row.id,
    jueriId: row.jueri_id,
    name: row.name,
    slug: row.slug,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  });
}
