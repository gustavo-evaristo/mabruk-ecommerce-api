import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import {
  AvailableAttribute,
  IProductRepository,
  ProductAttributeDefinition,
  ProductDetails,
  ProductListFilters,
  ProductListItem,
  ProductListResult,
} from 'src/domain/repositories/product.repository';
import { VariantAttributeValue } from 'src/domain/repositories/product-variant.repository';
import { ProductEntity, ProductStatus, ProductType } from 'src/domain/entities/product.entity';
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
      type: row.type as ProductType,
      categoryId: UUID.from(row.categoryId),
      basePrice: row.basePrice,
      sku: row.sku,
      price: row.price,
      stock: row.stock,
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
      price: row.price,
      stock: row.stock,
      isActive: row.isActive,
      weightInGrams: row.weightInGrams,
      isDefault: row.isDefault,
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

  private async loadVariantValues(
    variantIds: string[],
  ): Promise<Record<string, VariantAttributeValue[]>> {
    if (variantIds.length === 0) return {};
    const rows = await this.prisma.product_variant_values.findMany({
      where: { variantId: { in: variantIds } },
      include: {
        attributeValue: {
          include: { attribute: true },
        },
      },
    });
    const out: Record<string, VariantAttributeValue[]> = {};
    for (const r of rows) {
      if (!out[r.variantId]) out[r.variantId] = [];
      out[r.variantId].push({
        attributeId: r.attributeValue.attribute.id,
        attributeSlug: r.attributeValue.attribute.slug,
        attributeName: r.attributeValue.attribute.name,
        attributeType: r.attributeValue.attribute.type as 'SELECT' | 'COLOR',
        valueId: r.attributeValue.id,
        valueSlug: r.attributeValue.slug,
        valueName: r.attributeValue.name,
        valueHex: r.attributeValue.hex,
      });
    }
    return out;
  }

  private async expandListItems(productRows: any[]): Promise<ProductListItem[]> {
    if (productRows.length === 0) return [];
    const productIds = productRows.map((p) => p.id);
    const [variants, images] = await Promise.all([
      this.prisma.product_variants.findMany({
        where: { productId: { in: productIds }, isActive: true },
        orderBy: { createdAt: 'asc' },
      }),
      this.prisma.product_images.findMany({
        where: { productId: { in: productIds } },
        orderBy: [{ order: 'asc' }, { createdAt: 'asc' }],
      }),
    ]);
    const variantValues = await this.loadVariantValues(variants.map((v) => v.id));
    return productRows.map((p) => {
      const myVariants = variants.filter((v) => v.productId === p.id);
      const vv: Record<string, VariantAttributeValue[]> = {};
      for (const v of myVariants) vv[v.id] = variantValues[v.id] ?? [];
      return {
        product: this.toEntity(p),
        variants: myVariants.map((v) => this.variantToEntity(v)),
        variantValues: vv,
        images: images.filter((i) => i.productId === p.id).map((i) => this.imageToEntity(i)),
        categorySlug: p.category?.slug ?? '',
        categoryName: p.category?.name ?? '',
      };
    });
  }

  private buildAttributeFilters(
    attributeFilters: Record<string, string[]> | undefined,
  ): any[] {
    if (!attributeFilters) return [];
    const ANDs: any[] = [];
    for (const [attrSlug, valueSlugs] of Object.entries(attributeFilters)) {
      if (!valueSlugs?.length) continue;
      ANDs.push({
        variants: {
          some: {
            isActive: true,
            values: {
              some: {
                attributeValue: {
                  slug: { in: valueSlugs },
                  attribute: { slug: attrSlug },
                },
              },
            },
          },
        },
      });
    }
    return ANDs;
  }

  async list(filters: ProductListFilters): Promise<ProductListResult> {
    const page = filters.page ?? 1;
    const pageSize = filters.pageSize ?? 20;

    const AND: any[] = [{ deletedAt: null }];
    if (filters.status) {
      AND.push({
        status: Array.isArray(filters.status) ? { in: filters.status } : filters.status,
      });
    }
    if (filters.search) {
      AND.push({
        OR: [
          { name: { contains: filters.search, mode: 'insensitive' } },
          { description: { contains: filters.search, mode: 'insensitive' } },
          { slug: { contains: filters.search, mode: 'insensitive' } },
          { sku: { contains: filters.search, mode: 'insensitive' } },
        ],
      });
    }
    if (filters.categoryId) AND.push({ categoryId: filters.categoryId });
    if (filters.categorySlug) AND.push({ category: { slug: filters.categorySlug } });
    if (filters.collectionSlug) {
      AND.push({ collections: { some: { collection: { slug: filters.collectionSlug } } } });
    }
    if (filters.tagSlug) {
      AND.push({ tags: { some: { tag: { slug: filters.tagSlug } } } });
    }
    if (
      filters.minPriceCents !== undefined ||
      filters.maxPriceCents !== undefined ||
      filters.inStock
    ) {
      const variantWhere: any = { isActive: true };
      if (filters.minPriceCents !== undefined) {
        variantWhere.price = { ...(variantWhere.price || {}), gte: filters.minPriceCents };
      }
      if (filters.maxPriceCents !== undefined) {
        variantWhere.price = { ...(variantWhere.price || {}), lte: filters.maxPriceCents };
      }
      if (filters.inStock) variantWhere.stock = { gt: 0 };
      AND.push({ variants: { some: variantWhere } });
    }
    AND.push(...this.buildAttributeFilters(filters.attributeFilters));

    const where: any = { AND };

    const orderBy = (() => {
      switch (filters.sort) {
        case 'price_asc':
          return { basePrice: 'asc' as const };
        case 'price_desc':
          return { basePrice: 'desc' as const };
        case 'name_asc':
          return { name: 'asc' as const };
        case 'newest':
        default:
          return { createdAt: 'desc' as const };
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

    const items = await this.expandListItems(rows);
    const availableAttributes = await this.computeAvailableAttributes(where);

    return { items, availableAttributes, total, page, pageSize };
  }

  private async computeAvailableAttributes(productWhere: any): Promise<AvailableAttribute[]> {
    const rows = await this.prisma.product_variant_values.findMany({
      where: {
        variant: {
          isActive: true,
          product: productWhere,
        },
      },
      include: {
        attributeValue: { include: { attribute: true } },
        variant: { select: { productId: true } },
      },
    });

    const map = new Map<
      string,
      {
        attr: { slug: string; name: string; type: 'SELECT' | 'COLOR' };
        values: Map<
          string,
          { name: string; hex: string | null; order: number; products: Set<string> }
        >;
      }
    >();

    for (const r of rows) {
      const a = r.attributeValue.attribute;
      if (!map.has(a.slug)) {
        map.set(a.slug, {
          attr: { slug: a.slug, name: a.name, type: a.type as 'SELECT' | 'COLOR' },
          values: new Map(),
        });
      }
      const entry = map.get(a.slug)!;
      const v = r.attributeValue;
      if (!entry.values.has(v.slug)) {
        entry.values.set(v.slug, { name: v.name, hex: v.hex, order: v.order, products: new Set() });
      }
      entry.values.get(v.slug)!.products.add(r.variant.productId);
    }

    const result: AvailableAttribute[] = [];
    for (const { attr, values } of map.values()) {
      const valArr = Array.from(values.entries())
        .map(([slug, info]) => ({
          slug,
          name: info.name,
          hex: info.hex,
          count: info.products.size,
          order: info.order,
        }))
        .sort((a, b) => a.order - b.order || a.name.localeCompare(b.name));
      result.push({
        slug: attr.slug,
        name: attr.name,
        type: attr.type,
        values: valArr.map(({ order: _o, ...rest }) => rest),
      });
    }
    return result.sort((a, b) => a.name.localeCompare(b.name));
  }

  async get(id: string): Promise<ProductEntity | null> {
    const row = await this.prisma.products.findFirst({ where: { id, deletedAt: null } });
    return row ? this.toEntity(row) : null;
  }

  async findBySlug(slug: string): Promise<ProductEntity | null> {
    const row = await this.prisma.products.findFirst({ where: { slug, deletedAt: null } });
    return row ? this.toEntity(row) : null;
  }

  async getDetails(slugOrId: string): Promise<ProductDetails | null> {
    const row = await this.prisma.products.findFirst({
      where: {
        AND: [{ OR: [{ slug: slugOrId }, { id: slugOrId }] }, { deletedAt: null }],
      },
      include: {
        category: true,
        attributes: {
          orderBy: { order: 'asc' },
          include: {
            attribute: {
              include: { values: { orderBy: [{ order: 'asc' }, { name: 'asc' }] } },
            },
          },
        },
        variants: { orderBy: { createdAt: 'asc' } },
        images: { orderBy: [{ order: 'asc' }, { createdAt: 'asc' }] },
        tags: { include: { tag: true } },
      },
    });
    if (!row) return null;

    const variantValues = await this.loadVariantValues(row.variants.map((v) => v.id));
    const attributes: ProductAttributeDefinition[] = row.attributes.map((pa) => ({
      id: pa.attribute.id,
      slug: pa.attribute.slug,
      name: pa.attribute.name,
      type: pa.attribute.type as 'SELECT' | 'COLOR',
      order: pa.order,
      values: pa.attribute.values.map((v) => ({
        id: v.id,
        slug: v.slug,
        name: v.name,
        hex: v.hex,
        order: v.order,
      })),
    }));

    return {
      product: this.toEntity(row),
      attributes,
      variants: row.variants.map((v) => this.variantToEntity(v)),
      variantValues,
      images: row.images.map((i) => this.imageToEntity(i)),
      categorySlug: row.category.slug,
      categoryName: row.category.name,
      tags: row.tags.map((t) => ({ id: t.tag.id, slug: t.tag.slug, name: t.tag.name })),
    };
  }

  async create(p: ProductEntity, attributeIds: string[]): Promise<void> {
    await this.prisma.$transaction(async (tx) => {
      await tx.products.create({
        data: {
          id: p.id.toString(),
          slug: p.slug,
          name: p.name,
          description: p.description,
          status: p.status,
          type: p.type,
          categoryId: p.categoryId.toString(),
          basePrice: p.basePrice,
          sku: p.sku,
          price: p.price,
          stock: p.stock,
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
      if (attributeIds.length > 0) {
        await tx.product_attributes.createMany({
          data: attributeIds.map((attributeId, idx) => ({
            productId: p.id.toString(),
            attributeId,
            order: idx,
          })),
        });
      }
    });
  }

  async update(p: ProductEntity, attributeIds?: string[]): Promise<void> {
    await this.prisma.$transaction(async (tx) => {
      await tx.products.update({
        where: { id: p.id.toString() },
        data: {
          slug: p.slug,
          name: p.name,
          description: p.description,
          status: p.status,
          type: p.type,
          categoryId: p.categoryId.toString(),
          basePrice: p.basePrice,
          sku: p.sku,
          price: p.price,
          stock: p.stock,
          weightInGrams: p.weightInGrams,
          dimensionLength: p.dimensionLength,
          dimensionWidth: p.dimensionWidth,
          dimensionHeight: p.dimensionHeight,
          seoTitle: p.seoTitle,
          seoDescription: p.seoDescription,
          updatedAt: p.updatedAt,
        },
      });
      if (attributeIds !== undefined) {
        await tx.product_attributes.deleteMany({ where: { productId: p.id.toString() } });
        if (attributeIds.length > 0) {
          await tx.product_attributes.createMany({
            data: attributeIds.map((attributeId, idx) => ({
              productId: p.id.toString(),
              attributeId,
              order: idx,
            })),
          });
        }
      }
    });
  }

  async delete(id: string): Promise<void> {
    await this.prisma.products.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  async restore(id: string): Promise<void> {
    await this.prisma.products.update({
      where: { id },
      data: { deletedAt: null },
    });
  }

  async hardDelete(id: string): Promise<void> {
    await this.prisma.products.delete({ where: { id } });
  }

  async listDeleted(): Promise<ProductListItem[]> {
    const rows = await this.prisma.products.findMany({
      where: { deletedAt: { not: null } },
      orderBy: { deletedAt: 'desc' },
      include: { category: true },
    });
    return this.expandListItems(rows);
  }

  async hardDeleteExpired(olderThan: Date): Promise<number> {
    const result = await this.prisma.products.deleteMany({
      where: { deletedAt: { lt: olderThan } },
    });
    return result.count;
  }

  async listRelated(productId: string, limit: number): Promise<ProductListItem[]> {
    const product = await this.prisma.products.findUnique({ where: { id: productId } });
    if (!product) return [];
    const rows = await this.prisma.products.findMany({
      where: {
        status: 'ACTIVE',
        deletedAt: null,
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
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - 60);

    const grouped = await this.prisma.order_items.groupBy({
      by: ['variantId'],
      where: {
        order: {
          status: { in: ['PAID', 'PREPARING', 'SHIPPED', 'DELIVERED'] },
          createdAt: { gte: cutoff },
        },
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
            where: { id: { in: productIds }, status: 'ACTIVE', deletedAt: null },
            include: { category: true },
          })
        : await this.prisma.products.findMany({
            where: { status: 'ACTIVE', deletedAt: null },
            orderBy: { createdAt: 'desc' },
            take: limit,
            include: { category: true },
          });

    return this.expandListItems(rows);
  }

  async listAttributeIds(productId: string): Promise<string[]> {
    const rows = await this.prisma.product_attributes.findMany({
      where: { productId },
      orderBy: { order: 'asc' },
      select: { attributeId: true },
    });
    return rows.map((r) => r.attributeId);
  }
}
