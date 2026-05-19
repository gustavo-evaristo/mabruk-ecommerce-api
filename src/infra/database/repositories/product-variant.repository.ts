import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import {
  IProductVariantRepository,
  VariantAttributeValue,
} from 'src/domain/repositories/product-variant.repository';
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
      price: row.price,
      stock: row.stock,
      isActive: row.isActive,
      weightInGrams: row.weightInGrams,
      isDefault: row.isDefault,
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
      orderBy: { createdAt: 'asc' },
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

  async create(v: ProductVariantEntity, attributeValueIds: string[]): Promise<void> {
    await this.prisma.$transaction(async (tx) => {
      await tx.product_variants.create({
        data: {
          id: v.id.toString(),
          productId: v.productId.toString(),
          sku: v.sku,
          price: v.price,
          stock: v.stock,
          isActive: v.isActive,
          weightInGrams: v.weightInGrams,
          isDefault: v.isDefault,
          createdAt: v.createdAt,
          updatedAt: v.updatedAt,
        },
      });
      if (attributeValueIds.length > 0) {
        await tx.product_variant_values.createMany({
          data: attributeValueIds.map((avId) => ({
            variantId: v.id.toString(),
            attributeValueId: avId,
          })),
        });
      }
    });
  }

  async update(v: ProductVariantEntity, attributeValueIds?: string[]): Promise<void> {
    await this.prisma.$transaction(async (tx) => {
      await tx.product_variants.update({
        where: { id: v.id.toString() },
        data: {
          sku: v.sku,
          price: v.price,
          stock: v.stock,
          isActive: v.isActive,
          weightInGrams: v.weightInGrams,
          updatedAt: v.updatedAt,
        },
      });
      if (attributeValueIds !== undefined) {
        await tx.product_variant_values.deleteMany({ where: { variantId: v.id.toString() } });
        if (attributeValueIds.length > 0) {
          await tx.product_variant_values.createMany({
            data: attributeValueIds.map((avId) => ({
              variantId: v.id.toString(),
              attributeValueId: avId,
            })),
          });
        }
      }
    });
  }

  async delete(id: string): Promise<void> {
    await this.prisma.product_variants.delete({ where: { id } });
  }

  async getValuesForVariants(
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
    // ordena os values pela posição do atributo, depois pela posição do valor
    for (const k of Object.keys(out)) {
      out[k].sort((a, b) => a.attributeName.localeCompare(b.attributeName));
    }
    return out;
  }
}
