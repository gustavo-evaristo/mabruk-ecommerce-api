import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { IReviewRepository } from 'src/domain/repositories/review.repository';
import { ReviewEntity, ReviewStatus } from 'src/domain/entities/review.entity';
import { UUID } from 'src/domain/entities/vos';

@Injectable()
export class ReviewRepository implements IReviewRepository {
  constructor(private readonly prisma: PrismaService) {}

  private toEntity(row: any): ReviewEntity {
    return new ReviewEntity({
      id: UUID.from(row.id),
      productId: UUID.from(row.productId),
      customerId: UUID.from(row.customerId),
      rating: row.rating,
      comment: row.comment,
      status: row.status as ReviewStatus,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    });
  }

  async list(filters?: { status?: ReviewStatus; productId?: string }): Promise<ReviewEntity[]> {
    const where: any = {};
    if (filters?.status) where.status = filters.status;
    if (filters?.productId) where.productId = filters.productId;
    const rows = await this.prisma.reviews.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });
    return rows.map((r) => this.toEntity(r));
  }

  async listApprovedByProduct(productId: string): Promise<ReviewEntity[]> {
    const rows = await this.prisma.reviews.findMany({
      where: { productId, status: 'APPROVED' },
      orderBy: { createdAt: 'desc' },
    });
    return rows.map((r) => this.toEntity(r));
  }

  async get(id: string): Promise<ReviewEntity | null> {
    const row = await this.prisma.reviews.findUnique({ where: { id } });
    return row ? this.toEntity(row) : null;
  }

  async create(r: ReviewEntity): Promise<void> {
    await this.prisma.reviews.create({
      data: {
        id: r.id.toString(),
        productId: r.productId.toString(),
        customerId: r.customerId.toString(),
        rating: r.rating,
        comment: r.comment,
        status: r.status,
      },
    });
  }

  async update(r: ReviewEntity): Promise<void> {
    await this.prisma.reviews.update({
      where: { id: r.id.toString() },
      data: {
        rating: r.rating,
        comment: r.comment,
        status: r.status,
      },
    });
  }

  async delete(id: string): Promise<void> {
    await this.prisma.reviews.delete({ where: { id } });
  }
}
