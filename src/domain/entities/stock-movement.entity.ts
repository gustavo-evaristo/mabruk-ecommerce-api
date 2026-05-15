import { UUID } from './vos';

export type StockMovementReason =
  | 'ORDER_PAID'
  | 'ORDER_CANCELED'
  | 'MANUAL_IN'
  | 'MANUAL_OUT'
  | 'ADJUSTMENT';

type StockMovementEntityProps = {
  id?: UUID | string | null;
  variantId: UUID | string;
  delta: number;
  reason: StockMovementReason;
  referenceId?: string | null;
  notes?: string | null;
  createdAt?: Date | null;
};

export class StockMovementEntity {
  id: UUID;
  variantId: UUID;
  delta: number;
  reason: StockMovementReason;
  referenceId: string | null;
  notes: string | null;
  createdAt: Date;

  constructor(props: StockMovementEntityProps) {
    if (props.id instanceof UUID) {
      this.id = props.id;
    } else if (typeof props.id === 'string') {
      this.id = UUID.from(props.id);
    } else {
      this.id = UUID.generate();
    }
    this.variantId =
      props.variantId instanceof UUID ? props.variantId : UUID.from(props.variantId);
    this.delta = props.delta;
    this.reason = props.reason;
    this.referenceId = props.referenceId ?? null;
    this.notes = props.notes ?? null;
    this.createdAt = props.createdAt || new Date();
  }
}
