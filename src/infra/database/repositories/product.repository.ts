import { Injectable } from '@nestjs/common';
import { IProductRepository, ListProductsFilters, ListProductsResult } from '../../../domain/repositories/product.repository';
import { ProductEntity } from '../../../domain/entities/product.entity';
import { PrismaService } from '../prisma.service';

@Injectable()
export class PrismaProductRepository implements IProductRepository {
  constructor(private readonly prisma: PrismaService) {}

  async list(filters: ListProductsFilters): Promise<ListProductsResult> {
    const where: any = {
      is_active: filters.isActive ?? true,
      ...(filters.categoryId && { category_id: filters.categoryId }),
      ...(filters.subcategoryId && { subcategory_id: filters.subcategoryId }),
      ...(filters.platingType && { plating_type: filters.platingType }),
      ...(filters.isFeatured !== undefined && { is_featured: filters.isFeatured }),
      ...(filters.isRecommended !== undefined && { is_recommended: filters.isRecommended }),
      ...(filters.isFavorite !== undefined && { is_favorite: filters.isFavorite }),
      ...(filters.search && {
        name: { contains: filters.search, mode: 'insensitive' },
      }),
    };

    const page = filters.page ?? 1;
    const limit = filters.limit ?? 20;
    const skip = (page - 1) * limit;

    const [rows, total] = await Promise.all([
      this.prisma.db.products.findMany({
        where,
        skip,
        take: limit,
        orderBy: [{ display_order: 'asc' }, { created_at: 'desc' }],
        include: { images: { orderBy: { order: 'asc' } } },
      }),
      this.prisma.db.products.count({ where }),
    ]);

    return { products: rows.map(toEntity), total };
  }

  async findById(id: string): Promise<ProductEntity | null> {
    const row = await this.prisma.db.products.findUnique({ where: { id } });
    return row ? toEntity(row) : null;
  }

  async findBySlug(slug: string): Promise<ProductEntity | null> {
    const row = await this.prisma.db.products.findFirst({
      where: { name: { equals: slug, mode: 'insensitive' } },
    });
    return row ? toEntity(row) : null;
  }

  async findByJueriId(jueriId: number): Promise<ProductEntity | null> {
    const row = await this.prisma.db.products.findUnique({ where: { jueri_id: jueriId } });
    return row ? toEntity(row) : null;
  }

  async upsert(product: ProductEntity): Promise<void> {
    const data = {
      jueri_id: product.jueriId,
      sku: product.sku,
      name: product.name,
      description: product.description,
      description_full: product.descriptionFull,
      category_id: product.categoryId,
      subcategory_id: product.subcategoryId,
      plating_type: product.platingType,
      price: product.price,
      weight: product.weight,
      color: product.color,
      barcode: product.barcode,
      is_active: product.isActive,
      is_featured: product.isFeatured,
      is_recommended: product.isRecommended,
      is_favorite: product.isFavorite,
      display_order: product.displayOrder,
      last_synced_at: product.lastSyncedAt,
    };

    await this.prisma.db.products.upsert({
      where: { jueri_id: product.jueriId },
      create: { id: product.id.toString(), ...data },
      update: data,
    });
  }

  async updateFlags(
    id: string,
    flags: Partial<Pick<ProductEntity, 'isFeatured' | 'isRecommended' | 'isFavorite' | 'displayOrder'>>,
  ): Promise<void> {
    await this.prisma.db.products.update({
      where: { id },
      data: {
        ...(flags.isFeatured !== undefined && { is_featured: flags.isFeatured }),
        ...(flags.isRecommended !== undefined && { is_recommended: flags.isRecommended }),
        ...(flags.isFavorite !== undefined && { is_favorite: flags.isFavorite }),
        ...(flags.displayOrder !== undefined && { display_order: flags.displayOrder }),
      },
    });
  }

  async deactivateByJueriIds(activeJueriIds: number[]): Promise<number> {
    const result = await this.prisma.db.products.updateMany({
      where: { jueri_id: { notIn: activeJueriIds }, is_active: true },
      data: { is_active: false },
    });
    return result.count;
  }
}

function toEntity(row: any): ProductEntity {
  return new ProductEntity({
    id: row.id,
    jueriId: row.jueri_id,
    sku: row.sku,
    name: row.name,
    description: row.description,
    descriptionFull: row.description_full,
    categoryId: row.category_id,
    subcategoryId: row.subcategory_id,
    platingType: row.plating_type,
    price: Number(row.price),
    weight: row.weight ? Number(row.weight) : null,
    color: row.color,
    barcode: row.barcode,
    isActive: row.is_active,
    isFeatured: row.is_featured,
    isRecommended: row.is_recommended,
    isFavorite: row.is_favorite,
    displayOrder: row.display_order,
    lastSyncedAt: row.last_synced_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  });
}
