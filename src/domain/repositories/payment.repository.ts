import { PaymentEntity } from '../entities/payment.entity';

export abstract class IPaymentRepository {
  abstract create(payment: PaymentEntity): Promise<void>;
  abstract get(id: string): Promise<PaymentEntity | null>;
  abstract findByProviderTxId(providerTxId: string): Promise<PaymentEntity | null>;
  abstract update(payment: PaymentEntity): Promise<void>;
  abstract listByOrderId(orderId: string): Promise<PaymentEntity[]>;
}
