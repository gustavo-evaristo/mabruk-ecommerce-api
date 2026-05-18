import { UUID } from './vos';

export type ReviewStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

type ReviewEntityProps = {
  id?: UUID | string | null;
  productId: UUID | string;
  customerId: UUID | string;
  rating: number; // 1-5
  comment?: string | null;
  status?: ReviewStatus;
  createdAt?: Date | null;
  updatedAt?: Date | null;
};

export class ReviewEntity {
  id: UUID;
  productId: UUID;
  customerId: UUID;
  rating: number;
  comment: string | null;
  status: ReviewStatus;
  createdAt: Date;
  updatedAt: Date;

  constructor(props: ReviewEntityProps) {
    this.id = props.id instanceof UUID ? props.id : typeof props.id === 'string' ? UUID.from(props.id) : UUID.generate();
    this.productId = props.productId instanceof UUID ? props.productId : UUID.from(props.productId);
    this.customerId = props.customerId instanceof UUID ? props.customerId : UUID.from(props.customerId);
    if (!Number.isInteger(props.rating) || props.rating < 1 || props.rating > 5) {
      throw new Error('Rating must be integer between 1 and 5');
    }
    this.rating = props.rating;
    this.comment = props.comment ?? null;
    this.status = props.status ?? 'PENDING';
    const created = props.createdAt ?? new Date();
    this.createdAt = created;
    this.updatedAt = props.updatedAt ?? created;
  }

  setStatus(status: ReviewStatus) {
    this.status = status;
    this.updatedAt = new Date();
  }
}
