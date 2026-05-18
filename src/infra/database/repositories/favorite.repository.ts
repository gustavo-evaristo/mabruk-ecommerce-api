import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { IFavoriteRepository } from 'src/domain/repositories/favorite.repository';
import { ProductListItem } from 'src/domain/repositories/product.repository';
import { FavoriteEntity } from 'src/domain/entities/favorite.entity';
import { ProductEntity } from 'src/domain/entities/product.entity';
import { ProductVariantEntity } from 'src/domain/entities/product-variant.entity';
import { ProductImageEntity } from 'src/domain/entities/product-image.entity';
import { UUID } from 'src/domain/entities/vos';

@Injectable()
export class FavoriteRepository implements IFavoriteRepository {
  constructor(private readonly prisma: PrismaService) {}

  private toEntity(row: any): FavoriteEntity {
    return new FavoriteEntity({
      id: UUID.from(row.id),
      customerId: UUID.from(row.customerId),
      productId: UUID.from(row.productId),
      createdAt: row.createdAt,
    });
  }

  async listByCustomerId(customerId: string): Promise<FavoriteEntity[]> {
    const rows = await this.prisma.favorites.findMany({
      where: { customerId },
      orderBy: { createdAt: 'desc' },
    });
    return rows.map((r) => this.toEntity(r));
  }

  async listProductsByCustomerId(customerId: string): Promise<ProductListItem[]> {
    const favorites = await this.prisma.favorites.findMany({
      where: { customerId },
      orderBy: { createdAt: 'desc' },
      include: {
        product: {
          include: { category: true },
        },
      },
    });

    if (favorites.length === 0) return [];

    const products = favorites
      .map((f) => f.product)
      .filter((p) => p !== null && p.status === 'ACTIVE') as any[];

    if (products.length === 0) return [];

    const productIds = products.map((p) => p.id);
    const [variants, images] = await Promise.all([
      this.prisma.product_variants.findMany({
        where: { productId: { in: productIds }, isActive: true },
        orderBy: [{ banho: 'asc' }, { size: 'asc' }],
      }),
      this.prisma.product_images.findMany({
        where: { productId: { in: productIds } },
        orderBy: { order: 'asc' },
      }),
    ]);

    const variantsByProduct = new Map<string, any[]>();
    variants.forEach((v) => {
      const arr = variantsByProduct.get(v.productId) ?? [];
      arr.push(v);
      variantsByProduct.set(v.productId, arr);
    });
    const imagesByProduct = new Map<string, any[]>();
    images.forEach((i) => {
      const arr = imagesByProduct.get(i.productId) ?? [];
      arr.push(i);
      imagesByProduct.set(i.productId, arr);
    });

    return products.map((p) => ({
      product: new ProductEntity({
        id: UUID.from(p.id),
        slug: p.slug,
        name: p.name,
        description: p.description,
        status: p.status,
        categoryId: UUID.from(p.categoryId),
        basePrice: p.basePrice,
        weightInGrams: p.weightInGrams,
        dimensionLength: p.dimensionLength,
        dimensionWidth: p.dimensionWidth,
        dimensionHeight: p.dimensionHeight,
        seoTitle: p.seoTitle,
        seoDescription: p.seoDescription,
        createdAt: p.createdAt,
        updatedAt: p.updatedAt,
      }),
      variants: (variantsByProduct.get(p.id) ?? []).map(
        (v) =>
          new ProductVariantEntity({
            id: UUID.from(v.id),
            productId: UUID.from(v.productId),
            sku: v.sku,
            banho: v.banho,
            size: v.size,
            price: v.price,
            stock: v.stock,
            isActive: v.isActive,
            createdAt: v.createdAt,
            updatedAt: v.updatedAt,
          }),
      ),
      images: (imagesByProduct.get(p.id) ?? []).map(
        (i) =>
          new ProductImageEntity({
            id: UUID.from(i.id),
            productId: UUID.from(i.productId),
            variantId: i.variantId ? UUID.from(i.variantId) : null,
            url: i.url,
            alt: i.alt,
            order: i.order,
            createdAt: i.createdAt,
          }),
      ),
      categorySlug: p.category.slug,
      categoryName: p.category.name,
    }));
  }

  async findByCustomerAndProduct(
    customerId: string,
    productId: string,
  ): Promise<FavoriteEntity | null> {
    const row = await this.prisma.favorites.findUnique({
      where: { customerId_productId: { customerId, productId } },
    });
    return row ? this.toEntity(row) : null;
  }

  async create(favorite: FavoriteEntity): Promise<void> {
    await this.prisma.favorites.create({
      data: {
        id: favorite.id.toString(),
        customerId: favorite.customerId.toString(),
        productId: favorite.productId.toString(),
      },
    });
  }

  async delete(customerId: string, productId: string): Promise<void> {
    await this.prisma.favorites.deleteMany({
      where: { customerId, productId },
    });
  }
}
