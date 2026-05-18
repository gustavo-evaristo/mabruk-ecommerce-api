import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { IReviewRepository } from 'src/domain/repositories/review.repository';
import { IProductRepository } from 'src/domain/repositories/product.repository';
import { ReviewEntity, ReviewStatus } from 'src/domain/entities/review.entity';

@Injectable()
export class ListReviewsAdminUseCase {
  constructor(private readonly repo: IReviewRepository) {}
  async execute(filters?: { status?: ReviewStatus }): Promise<ReviewEntity[]> {
    return this.repo.list(filters);
  }
}

@Injectable()
export class ListReviewsByProductB2CUseCase {
  constructor(private readonly repo: IReviewRepository) {}
  async execute(productId: string): Promise<ReviewEntity[]> {
    return this.repo.listApprovedByProduct(productId);
  }
}

interface CreateReviewInput {
  productSlug: string;
  customerId: string;
  rating: number;
  comment?: string;
}

@Injectable()
export class CreateReviewUseCase {
  constructor(
    private readonly reviews: IReviewRepository,
    private readonly products: IProductRepository,
  ) {}

  async execute(input: CreateReviewInput): Promise<ReviewEntity> {
    const product = await this.products.findBySlug(input.productSlug);
    if (!product) throw new NotFoundException('Product not found');

    const review = new ReviewEntity({
      productId: product.id,
      customerId: input.customerId,
      rating: input.rating,
      comment: input.comment,
      status: 'PENDING',
    });
    await this.reviews.create(review);
    return review;
  }
}

@Injectable()
export class ModerateReviewUseCase {
  constructor(private readonly repo: IReviewRepository) {}

  async execute(id: string, status: ReviewStatus): Promise<ReviewEntity> {
    const r = await this.repo.get(id);
    if (!r) throw new NotFoundException('Review not found');
    r.setStatus(status);
    await this.repo.update(r);
    return r;
  }
}

@Injectable()
export class DeleteReviewUseCase {
  constructor(private readonly repo: IReviewRepository) {}
  async execute(id: string, requesterCustomerId?: string): Promise<void> {
    const r = await this.repo.get(id);
    if (!r) throw new NotFoundException('Review not found');
    if (requesterCustomerId && r.customerId.toString() !== requesterCustomerId) {
      throw new ForbiddenException();
    }
    await this.repo.delete(id);
  }
}
