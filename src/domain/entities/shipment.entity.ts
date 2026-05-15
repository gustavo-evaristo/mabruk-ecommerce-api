import { UUID } from './vos';

type ShipmentEntityProps = {
  id?: UUID | string | null;
  orderId: UUID | string;
  carrier: string;
  service: string;
  externalOrderId?: string | null;
  trackingCode?: string | null;
  cost: number;
  estimatedDays: number;
  shippedAt?: Date | null;
  deliveredAt?: Date | null;
  createdAt?: Date | null;
  updatedAt?: Date | null;
};

export class ShipmentEntity {
  id: UUID;
  orderId: UUID;
  carrier: string;
  service: string;
  externalOrderId: string | null;
  trackingCode: string | null;
  cost: number;
  estimatedDays: number;
  shippedAt: Date | null;
  deliveredAt: Date | null;
  createdAt: Date;
  updatedAt: Date;

  constructor(props: ShipmentEntityProps) {
    if (props.id instanceof UUID) {
      this.id = props.id;
    } else if (typeof props.id === 'string') {
      this.id = UUID.from(props.id);
    } else {
      this.id = UUID.generate();
    }
    this.orderId = props.orderId instanceof UUID ? props.orderId : UUID.from(props.orderId);
    this.carrier = props.carrier;
    this.service = props.service;
    this.externalOrderId = props.externalOrderId ?? null;
    this.trackingCode = props.trackingCode ?? null;
    this.cost = props.cost;
    this.estimatedDays = props.estimatedDays;
    this.shippedAt = props.shippedAt ?? null;
    this.deliveredAt = props.deliveredAt ?? null;

    const createdAt = props.createdAt || new Date();
    this.createdAt = createdAt;
    this.updatedAt = props.updatedAt || createdAt;
  }

  private touch() {
    this.updatedAt = new Date();
  }

  attachTracking(code: string, carrier?: string) {
    this.trackingCode = code;
    if (carrier) this.carrier = carrier;
    this.shippedAt = this.shippedAt ?? new Date();
    this.touch();
  }

  markDelivered() {
    this.deliveredAt = new Date();
    this.touch();
  }
}
