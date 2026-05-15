import { UUID } from './vos';

export type OrderStatus =
  | 'PENDING_PAYMENT'
  | 'PAID'
  | 'PREPARING'
  | 'SHIPPED'
  | 'DELIVERED'
  | 'CANCELED'
  | 'REFUNDED';

export interface CustomerSnapshot {
  name: string;
  email: string;
  phone?: string | null;
  cpf?: string | null;
}

export interface ShippingAddressSnapshot {
  recipient: string;
  zipCode: string;
  street: string;
  number: string;
  complement?: string | null;
  neighborhood: string;
  city: string;
  state: string;
}

type OrderEntityProps = {
  id?: UUID | string | null;
  number: string;
  customerId?: UUID | string | null;
  customerSnapshot: CustomerSnapshot;
  status?: OrderStatus;
  itemsTotal: number;
  shippingTotal?: number;
  discountTotal?: number;
  grandTotal: number;
  shippingAddress: ShippingAddressSnapshot;
  invoiceNumber?: string | null;
  notes?: string | null;
  createdAt?: Date | null;
  updatedAt?: Date | null;
};

/**
 * Transições válidas no MVP.
 * (Estende facilmente quando integrar Mercado Pago / Melhor Envio.)
 */
const TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  PENDING_PAYMENT: ['PAID', 'CANCELED'],
  PAID: ['PREPARING', 'CANCELED', 'REFUNDED'],
  PREPARING: ['SHIPPED', 'CANCELED'],
  SHIPPED: ['DELIVERED'],
  DELIVERED: ['REFUNDED'],
  CANCELED: [],
  REFUNDED: [],
};

export class OrderEntity {
  id: UUID;
  number: string;
  customerId: UUID | null;
  customerSnapshot: CustomerSnapshot;
  status: OrderStatus;
  itemsTotal: number;
  shippingTotal: number;
  discountTotal: number;
  grandTotal: number;
  shippingAddress: ShippingAddressSnapshot;
  invoiceNumber: string | null;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;

  constructor(props: OrderEntityProps) {
    if (props.id instanceof UUID) {
      this.id = props.id;
    } else if (typeof props.id === 'string') {
      this.id = UUID.from(props.id);
    } else {
      this.id = UUID.generate();
    }
    this.number = props.number;

    if (!props.customerId) {
      this.customerId = null;
    } else if (props.customerId instanceof UUID) {
      this.customerId = props.customerId;
    } else {
      this.customerId = UUID.from(props.customerId);
    }

    this.customerSnapshot = props.customerSnapshot;
    this.status = props.status ?? 'PENDING_PAYMENT';
    this.itemsTotal = props.itemsTotal;
    this.shippingTotal = props.shippingTotal ?? 0;
    this.discountTotal = props.discountTotal ?? 0;
    this.grandTotal = props.grandTotal;
    this.shippingAddress = props.shippingAddress;
    this.invoiceNumber = props.invoiceNumber ?? null;
    this.notes = props.notes ?? null;

    const createdAt = props.createdAt || new Date();
    this.createdAt = createdAt;
    this.updatedAt = props.updatedAt || createdAt;
  }

  private touch() {
    this.updatedAt = new Date();
  }

  transitionTo(next: OrderStatus) {
    const allowed = TRANSITIONS[this.status] ?? [];
    if (!allowed.includes(next)) {
      throw new Error(
        `Invalid order status transition: ${this.status} → ${next}`,
      );
    }
    this.status = next;
    this.touch();
  }

  attachInvoice(invoiceNumber: string) {
    this.invoiceNumber = invoiceNumber;
    this.touch();
  }
}
