import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { IProductImageRepository } from 'src/domain/repositories/product-image.repository';
import { ProductImageEntity } from 'src/domain/entities/product-image.entity';
import { UUID } from 'src/domain/entities/vos';

@Injectable()
export class ProductImageRepository implements IProductImageRepository {
  constructor(private readonly prisma: PrismaService) {}

  private toEntity(row: any): ProductImageEntity {
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

  async listByProductId(productId: string): Promise<ProductImageEntity[]> {
    const rows = await this.prisma.product_images.findMany({
      where: { productId },
      orderBy: [{ order: 'asc' }, { createdAt: 'asc' }],
    });
    return rows.map((r) => this.toEntity(r));
  }

  async get(id: string): Promise<ProductImageEntity | null> {
    const row = await this.prisma.product_images.findUnique({ where: { id } });
    return row ? this.toEntity(row) : null;
  }

  async create(img: ProductImageEntity): Promise<void> {
    await this.prisma.product_images.create({
      data: {
        id: img.id.toString(),
        productId: img.productId.toString(),
        variantId: img.variantId?.toString() ?? null,
        url: img.url,
        alt: img.alt,
        order: img.order,
        createdAt: img.createdAt,
      },
    });
  }

  async delete(id: string): Promise<void> {
    await this.prisma.product_images.delete({ where: { id } });
  }

  async reorder(productId: string, orderedIds: string[]): Promise<void> {
    await this.prisma.$transaction(
      orderedIds.map((id, idx) =>
        this.prisma.product_images.update({
          where: { id },
          data: { order: idx },
        }),
      ),
    );
  }
}
