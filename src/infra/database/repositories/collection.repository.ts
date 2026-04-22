import { Injectable } from '@nestjs/common';
import { ICollectionRepository, CollectionWithProducts } from '../../../domain/repositories/collection.repository';
import { CollectionEntity } from '../../../domain/entities/collection.entity';
import { ProductEntity } from '../../../domain/entities/product.entity';
import { PrismaService } from '../prisma.service';

@Injectable()
export class PrismaCollectionRepository implements ICollectionRepository {
  constructor(private readonly prisma: PrismaService) {}

  async list(): Promise<CollectionEntity[]> {
    const rows = await this.prisma.db.collections.findMany({
      where: { is_active: true },
      orderBy: [{ display_order: 'asc' }, { created_at: 'desc' }],
    });
    return rows.map(toCollectionEntity);
  }

  async findBySlug(slug: string): Promise<CollectionWithProducts | null> {
    const row = await this.prisma.db.collections.findUnique({
      where: { slug },
      include: {
        products: {
          orderBy: { display_order: 'asc' },
          include: { product: true },
        },
      },
    });

    if (!row) return null;

    return {
      collection: toCollectionEntity(row),
      products: row.products.map((cp: any) => toProductEntity(cp.product)),
    };
  }

  async findById(id: string): Promise<CollectionEntity | null> {
    const row = await this.prisma.db.collections.findUnique({ where: { id } });
    return row ? toCollectionEntity(row) : null;
  }

  async create(collection: CollectionEntity): Promise<void> {
    await this.prisma.db.collections.create({
      data: {
        id: collection.id.toString(),
        name: collection.name,
        slug: collection.slug,
        description: collection.description,
        cover_image: collection.coverImage,
        is_active: collection.isActive,
        display_order: collection.displayOrder,
      },
    });
  }

  async addProduct(collectionId: string, productId: string, displayOrder = 0): Promise<void> {
    await this.prisma.db.collection_products.upsert({
      where: { collection_id_product_id: { collection_id: collectionId, product_id: productId } },
      create: { collection_id: collectionId, product_id: productId, display_order: displayOrder },
      update: { display_order: displayOrder },
    });
  }

  async removeProduct(collectionId: string, productId: string): Promise<void> {
    await this.prisma.db.collection_products.delete({
      where: { collection_id_product_id: { collection_id: collectionId, product_id: productId } },
    });
  }
}

function toCollectionEntity(row: any): CollectionEntity {
  return new CollectionEntity({
    id: row.id,
    name: row.name,
    slug: row.slug,
    description: row.description,
    coverImage: row.cover_image,
    isActive: row.is_active,
    displayOrder: row.display_order,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  });
}

function toProductEntity(row: any): ProductEntity {
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
