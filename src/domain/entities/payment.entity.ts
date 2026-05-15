import { UUID } from './vos';

export type PaymentMethod = 'PIX' | 'CREDIT_CARD';
export type PaymentStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'REFUNDED';

type PaymentEntityProps = {
  id?: UUID | string | null;
  orderId: UUID | string;
  method: PaymentMethod;
  provider: string;
  providerTxId: string;
  status?: PaymentStatus;
  installments?: number | null;
  amount: number;
  qrCode?: string | null;
  qrCodeBase64?: string | null;
  expiresAt?: Date | null;
  paidAt?: Date | null;
  raw?: unknown;
  createdAt?: Date | null;
  updatedAt?: Date | null;
};

export class PaymentEntity {
  id: UUID;
  orderId: UUID;
  method: PaymentMethod;
  provider: string;
  providerTxId: string;
  status: PaymentStatus;
  installments: number | null;
  amount: number;
  qrCode: string | null;
  qrCodeBase64: string | null;
  expiresAt: Date | null;
  paidAt: Date | null;
  raw: unknown;
  createdAt: Date;
  updatedAt: Date;

  constructor(props: PaymentEntityProps) {
    if (props.id instanceof UUID) {
      this.id = props.id;
    } else if (typeof props.id === 'string') {
      this.id = UUID.from(props.id);
    } else {
      this.id = UUID.generate();
    }
    this.orderId = props.orderId instanceof UUID ? props.orderId : UUID.from(props.orderId);
    this.method = props.method;
    this.provider = props.provider;
    this.providerTxId = props.providerTxId;
    this.status = props.status ?? 'PENDING';
    this.installments = props.installments ?? null;
    this.amount = props.amount;
    this.qrCode = props.qrCode ?? null;
    this.qrCodeBase64 = props.qrCodeBase64 ?? null;
    this.expiresAt = props.expiresAt ?? null;
    this.paidAt = props.paidAt ?? null;
    this.raw = props.raw ?? null;

    const createdAt = props.createdAt || new Date();
    this.createdAt = createdAt;
    this.updatedAt = props.updatedAt || createdAt;
  }

  private touch() {
    this.updatedAt = new Date();
  }

  approve() {
    this.status = 'APPROVED';
    this.paidAt = new Date();
    this.touch();
  }

  reject() {
    this.status = 'REJECTED';
    this.touch();
  }

  refund() {
    this.status = 'REFUNDED';
    this.touch();
  }
}
