import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { IProductVariantRepository } from 'src/domain/repositories/product-variant.repository';
import { ProductVariantEntity } from 'src/domain/entities/product-variant.entity';
import { UUID } from 'src/domain/entities/vos';

@Injectable()
export class ProductVariantRepository implements IProductVariantRepository {
  constructor(private readonly prisma: PrismaService) {}

  private toEntity(row: any): ProductVariantEntity {
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

  async get(id: string): Promise<ProductVariantEntity | null> {
    const row = await this.prisma.product_variants.findUnique({ where: { id } });
    return row ? this.toEntity(row) : null;
  }

  async findBySku(sku: string): Promise<ProductVariantEntity | null> {
    const row = await this.prisma.product_variants.findUnique({ where: { sku } });
    return row ? this.toEntity(row) : null;
  }

  async listByProductId(productId: string): Promise<ProductVariantEntity[]> {
    const rows = await this.prisma.product_variants.findMany({
      where: { productId },
      orderBy: [{ banho: 'asc' }, { size: 'asc' }],
    });
    return rows.map((r) => this.toEntity(r));
  }

  async listByIds(ids: string[]): Promise<ProductVariantEntity[]> {
    if (ids.length === 0) return [];
    const rows = await this.prisma.product_variants.findMany({
      where: { id: { in: ids } },
    });
    return rows.map((r) => this.toEntity(r));
  }

  async create(v: ProductVariantEntity): Promise<void> {
    await this.prisma.product_variants.create({
      data: {
        id: v.id.toString(),
        productId: v.productId.toString(),
        sku: v.sku,
        banho: v.banho,
        size: v.size,
        price: v.price,
        stock: v.stock,
        isActive: v.isActive,
        createdAt: v.createdAt,
        updatedAt: v.updatedAt,
      },
    });
  }

  async update(v: ProductVariantEntity): Promise<void> {
    await this.prisma.product_variants.update({
      where: { id: v.id.toString() },
      data: {
        sku: v.sku,
        banho: v.banho,
        size: v.size,
        price: v.price,
        stock: v.stock,
        isActive: v.isActive,
        updatedAt: v.updatedAt,
      },
    });
  }

  async delete(id: string): Promise<void> {
    await this.prisma.product_variants.delete({ where: { id } });
  }
}
