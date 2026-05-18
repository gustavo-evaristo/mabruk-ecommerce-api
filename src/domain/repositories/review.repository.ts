import { ReviewEntity, ReviewStatus } from '../entities/review.entity';

export abstract class IReviewRepository {
  abstract list(filters?: { status?: ReviewStatus; productId?: string }): Promise<ReviewEntity[]>;
  abstract listApprovedByProduct(productId: string): Promise<ReviewEntity[]>;
  abstract get(id: string): Promise<ReviewEntity | null>;
  abstract create(r: ReviewEntity): Promise<void>;
  abstract update(r: ReviewEntity): Promise<void>;
  abstract delete(id: string): Promise<void>;
}
