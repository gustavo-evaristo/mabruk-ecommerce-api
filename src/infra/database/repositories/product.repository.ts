import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import {
  IProductRepository,
  ProductDetails,
  ProductListFilters,
  ProductListItem,
  ProductListResult,
} from 'src/domain/repositories/product.repository';
import { ProductEntity, ProductStatus } from 'src/domain/entities/product.entity';
import { ProductVariantEntity } from 'src/domain/entities/product-variant.entity';
import { ProductImageEntity } from 'src/domain/entities/product-image.entity';
import { UUID } from 'src/domain/entities/vos';

@Injectable()
export class ProductRepository implements IProductRepository {
  constructor(private readonly prisma: PrismaService) {}

  private toEntity(row: any): ProductEntity {
    return new ProductEntity({
      id: UUID.from(row.id),
      slug: row.slug,
      name: row.name,
      description: row.description,
      status: row.status as ProductStatus,
      categoryId: UUID.from(row.categoryId),
      basePrice: row.basePrice,
      weightInGrams: row.weightInGrams,
      dimensionLength: row.dimensionLength,
      dimensionWidth: row.dimensionWidth,
      dimensionHeight: row.dimensionHeight,
      seoTitle: row.seoTitle,
      seoDescription: row.seoDescription,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    });
  }

  private variantToEntity(row: any): ProductVariantEntity {
    return new ProductVariantEntity({
      id: UUID.from(row.id),
      productId: UUID.from(row.productId),
      sku: row.sku,
      banho: row.banho,
      size: row.size,
      price: row.price,
      stock: row.stock,
      isActive: row.isActive,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    });
  }

  private imageToEntity(row: any): ProductImageEntity {
    return new ProductImageEntity({
      id: UUID.from(row.id),
      productId: UUID.from(row.productId),
      variantId: row.variantId ? UUID.from(row.variantId) : null,
      url: row.url,
      alt: row.alt,
      order: row.order,
      createdAt: row.createdAt,
    });
  }

  private async expandListItems(productRows: any[]): Promise<ProductListItem[]> {
    if (productRows.length === 0) return [];
    const productIds = productRows.map((p) => p.id);
    const [variants, images] = await Promise.all([
      this.prisma.product_variants.findMany({
        where: { productId: { in: productIds }, isActive: true },
        orderBy: [{ banho: 'asc' }, { size: 'asc' }],
      }),
      this.prisma.product_images.findMany({
        where: { productId: { in: productIds } },
        orderBy: [{ order: 'asc' }, { createdAt: 'asc' }],
      }),
    ]);
    return productRows.map((p) => ({
      product: this.toEntity(p),
      variants: variants.filter((v) => v.productId === p.id).map((v) => this.variantToEntity(v)),
      images: images.filter((i) => i.productId === p.id).map((i) => this.imageToEntity(i)),
      categorySlug: p.category?.slug ?? '',
      categoryName: p.category?.name ?? '',
    }));
  }

  async list(filters: ProductListFilters): Promise<ProductListResult> {
    const page = filters.page ?? 1;
    const pageSize = filters.pageSize ?? 20;

    const where: any = {};
    if (filters.status) {
      where.status = Array.isArray(filters.status) ? { in: filters.status } : filters.status;
    }
    if (filters.search) {
      where.OR = [
        { name: { contains: filters.search, mode: 'insensitive' } },
        { description: { contains: filters.search, mode: 'insensitive' } },
        { slug: { contains: filters.search, mode: 'insensitive' } },
      ];
    }
    if (filters.categoryId) where.categoryId = filters.categoryId;
    if (filters.categorySlug) where.category = { slug: filters.categorySlug };
    if (filters.collectionSlug) {
      where.collections = { some: { collection: { slug: filters.collectionSlug } } };
    }
    if (filters.tagSlug) {
      where.tags = { some: { tag: { slug: filters.tagSlug } } };
    }
    if (filters.banho || filters.minPriceCents || filters.maxPriceCents || filters.inStock) {
      const variantWhere: any = { isActive: true };
      if (filters.banho) variantWhere.banho = filters.banho;
      if (filters.minPriceCents !== undefined) variantWhere.price = { ...(variantWhere.price || {}), gte: filters.minPriceCents };
      if (filters.maxPriceCents !== undefined) variantWhere.price = { ...(variantWhere.price || {}), lte: filters.maxPriceCents };
      if (filters.inStock) variantWhere.stock = { gt: 0 };
      where.variants = { some: variantWhere };
    }

    const orderBy = (() => {
      switch (filters.sort) {
        case 'price_asc': return { basePrice: 'asc' as const };
        case 'price_desc': return { basePrice: 'desc' as const };
        case 'name_asc': return { name: 'asc' as const };
        case 'newest':
        default: return { createdAt: 'desc' as const };
      }
    })();

    const [rows, total] = await Promise.all([
      this.prisma.products.findMany({
        where,
        orderBy,
        skip: (page - 1) * pageSize,
        take: pageSize,
        include: { category: true },
      }),
      this.prisma.products.count({ where }),
    ]);

    return {
      items: await this.expandListItems(rows),
      total,
      page,
      pageSize,
    };
  }

  async get(id: string): Promise<ProductEntity | null> {
    const row = await this.prisma.products.findUnique({ where: { id } });
    return row ? this.toEntity(row) : null;
  }

  async findBySlug(slug: string): Promise<ProductEntity | null> {
    const row = await this.prisma.products.findUnique({ where: { slug } });
    return row ? this.toEntity(row) : null;
  }

  async getDetails(slugOrId: string): Promise<ProductDetails | null> {
    const row = await this.prisma.products.findFirst({
      where: { OR: [{ slug: slugOrId }, { id: slugOrId }] },
      include: {
        category: true,
        variants: { orderBy: [{ banho: 'asc' }, { size: 'asc' }] },
        images: { orderBy: [{ order: 'asc' }, { createdAt: 'asc' }] },
        tags: { include: { tag: true } },
      },
    });
    if (!row) return null;

    return {
      product: this.toEntity(row),
      variants: row.variants.map((v) => this.variantToEntity(v)),
      images: row.images.map((i) => this.imageToEntity(i)),
      categorySlug: row.category.slug,
      categoryName: row.category.name,
      tags: row.tags.map((t) => ({ id: t.tag.id, slug: t.tag.slug, name: t.tag.name })),
    };
  }

  async create(p: ProductEntity): Promise<void> {
    await this.prisma.products.create({
      data: {
        id: p.id.toString(),
        slug: p.slug,
        name: p.name,
        description: p.description,
        status: p.status,
        categoryId: p.categoryId.toString(),
        basePrice: p.basePrice,
        weightInGrams: p.weightInGrams,
        dimensionLength: p.dimensionLength,
        dimensionWidth: p.dimensionWidth,
        dimensionHeight: p.dimensionHeight,
        seoTitle: p.seoTitle,
        seoDescription: p.seoDescription,
        createdAt: p.createdAt,
        updatedAt: p.updatedAt,
      },
    });
  }

  async update(p: ProductEntity): Promise<void> {
    await this.prisma.products.update({
      where: { id: p.id.toString() },
      data: {
        slug: p.slug,
        name: p.name,
        description: p.description,
        status: p.status,
        categoryId: p.categoryId.toString(),
        basePrice: p.basePrice,
        weightInGrams: p.weightInGrams,
        dimensionLength: p.dimensionLength,
        dimensionWidth: p.dimensionWidth,
        dimensionHeight: p.dimensionHeight,
        seoTitle: p.seoTitle,
        seoDescription: p.seoDescription,
        updatedAt: p.updatedAt,
      },
    });
  }

  async delete(id: string): Promise<void> {
    await this.prisma.products.delete({ where: { id } });
  }

  async listRelated(productId: string, limit: number): Promise<ProductListItem[]> {
    const product = await this.prisma.products.findUnique({ where: { id: productId } });
    if (!product) return [];
    const rows = await this.prisma.products.findMany({
      where: {
        status: 'ACTIVE',
        categoryId: product.categoryId,
        id: { not: productId },
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
      include: { category: true },
    });
    return this.expandListItems(rows);
  }

  async listFeatured(limit: number): Promise<ProductListItem[]> {
    // Mais vendidos dos últimos 60 dias; fallback para produtos ativos mais recentes
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - 60);

    const grouped = await this.prisma.order_items.groupBy({
      by: ['variantId'],
      where: {
        order: { status: { in: ['PAID', 'PREPARING', 'SHIPPED', 'DELIVERED'] }, createdAt: { gte: cutoff } },
      },
      _sum: { quantity: true },
      orderBy: { _sum: { quantity: 'desc' } },
      take: limit * 3,
    });

    const variantIds = grouped.map((g) => g.variantId);
    let productIds: string[] = [];
    if (variantIds.length > 0) {
      const variants = await this.prisma.product_variants.findMany({
        where: { id: { in: variantIds } },
        select: { productId: true },
      });
      productIds = Array.from(new Set(variants.map((v) => v.productId))).slice(0, limit);
    }

    const rows =
      productIds.length > 0
        ? await this.prisma.products.findMany({
            where: { id: { in: productIds }, status: 'ACTIVE' },
            include: { category: true },
          })
        : await this.prisma.products.findMany({
            where: { status: 'ACTIVE' },
            orderBy: { createdAt: 'desc' },
            take: limit,
            include: { category: true },
          });

    return this.expandListItems(rows);
  }
}
