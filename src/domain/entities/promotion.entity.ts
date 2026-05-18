import { UUID } from './vos';

export type PromotionType = 'CAMPAIGN' | 'COUPON' | 'RULE';
export type DiscountType = 'PERCENT' | 'FIXED_CENTS' | 'FREE_SHIPPING';
export type PromotionStatus = 'ACTIVE' | 'SCHEDULED' | 'EXPIRED' | 'PAUSED';

type PromotionEntityProps = {
  id?: UUID | string | null;
  type: PromotionType;
  name: string;
  code?: string | null;
  description?: string | null;
  discountType: DiscountType;
  discountValue: number; // percent: 0-100; fixed: cents
  scope?: string | null; // ex: 'all', 'collection:oasis', 'category:colares'
  usesMax?: number | null;
  usesCount?: number;
  startsAt?: Date | null;
  expiresAt?: Date | null;
  status?: PromotionStatus;
  createdAt?: Date | null;
  updatedAt?: Date | null;
};

export class PromotionEntity {
  id: UUID;
  type: PromotionType;
  name: string;
  code: string | null;
  description: string | null;
  discountType: DiscountType;
  discountValue: number;
  scope: string | null;
  usesMax: number | null;
  usesCount: number;
  startsAt: Date | null;
  expiresAt: Date | null;
  status: PromotionStatus;
  createdAt: Date;
  updatedAt: Date;

  constructor(props: PromotionEntityProps) {
    this.id = props.id instanceof UUID ? props.id : typeof props.id === 'string' ? UUID.from(props.id) : UUID.generate();
    this.type = props.type;
    this.name = props.name;
    this.code = props.code ?? null;
    this.description = props.description ?? null;
    this.discountType = props.discountType;
    this.discountValue = props.discountValue;
    this.scope = props.scope ?? 'all';
    this.usesMax = props.usesMax ?? null;
    this.usesCount = props.usesCount ?? 0;
    this.startsAt = props.startsAt ?? null;
    this.expiresAt = props.expiresAt ?? null;
    this.status = props.status ?? 'ACTIVE';
    const created = props.createdAt ?? new Date();
    this.createdAt = created;
    this.updatedAt = props.updatedAt ?? created;
  }

  private touch() {
    this.updatedAt = new Date();
  }

  update(props: Partial<PromotionEntityProps>) {
    if (props.name !== undefined) this.name = props.name;
    if (props.code !== undefined) this.code = props.code ?? null;
    if (props.description !== undefined) this.description = props.description ?? null;
    if (props.discountType !== undefined) this.discountType = props.discountType;
    if (props.discountValue !== undefined) this.discountValue = props.discountValue;
    if (props.scope !== undefined) this.scope = props.scope ?? 'all';
    if (props.usesMax !== undefined) this.usesMax = props.usesMax ?? null;
    if (props.startsAt !== undefined) this.startsAt = props.startsAt ?? null;
    if (props.expiresAt !== undefined) this.expiresAt = props.expiresAt ?? null;
    if (props.status !== undefined) this.status = props.status;
    this.touch();
  }
}
