import { Injectable } from '@nestjs/common';
import { ISubcategoryRepository } from '../../../domain/repositories/subcategory.repository';
import { SubcategoryEntity } from '../../../domain/entities/subcategory.entity';
import { PrismaService } from '../prisma.service';

@Injectable()
export class PrismaSubcategoryRepository implements ISubcategoryRepository {
  constructor(private readonly prisma: PrismaService) {}

  async list(): Promise<SubcategoryEntity[]> {
    const rows = await this.prisma.db.subcategories.findMany({ orderBy: { name: 'asc' } });
    return rows.map(toEntity);
  }

  async findByJueriId(jueriId: number): Promise<SubcategoryEntity | null> {
    const row = await this.prisma.db.subcategories.findUnique({ where: { jueri_id: jueriId } });
    return row ? toEntity(row) : null;
  }

  async upsert(subcategory: SubcategoryEntity): Promise<SubcategoryEntity> {
    const data = {
      jueri_id: subcategory.jueriId,
      category_id: subcategory.categoryId,
      name: subcategory.name,
      slug: subcategory.slug,
    };

    const row = await this.prisma.db.subcategories.upsert({
      where: { jueri_id: subcategory.jueriId },
      create: { id: subcategory.id.toString(), ...data },
      update: data,
    });

    return toEntity(row);
  }
}

function toEntity(row: any): SubcategoryEntity {
  return new SubcategoryEntity({
    id: row.id,
    jueriId: row.jueri_id,
    categoryId: row.category_id,
    name: row.name,
    slug: row.slug,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  });
}
