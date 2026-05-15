import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { IOrderRepository } from 'src/domain/repositories/order.repository';
import { IPaymentRepository } from 'src/domain/repositories/payment.repository';
import { PaymentGateway } from 'src/domain/services/payment-gateway';
import { PaymentEntity } from 'src/domain/entities/payment.entity';

export interface CreatePixPaymentOutput {
  paymentId: string;
  providerTxId: string;
  status: string;
  qrCode?: string | null;
  qrCodeBase64?: string | null;
  expiresAt?: Date | null;
  amountCents: number;
}

@Injectable()
export class CreatePixPaymentUseCase {
  constructor(
    private readonly orderRepository: IOrderRepository,
    private readonly paymentRepository: IPaymentRepository,
    private readonly gateway: PaymentGateway,
  ) {}

  async execute(orderId: string): Promise<CreatePixPaymentOutput> {
    const order = await this.orderRepository.get(orderId);
    if (!order) throw new NotFoundException('Order not found');
    if (order.status !== 'PENDING_PAYMENT') {
      throw new BadRequestException(`Order not awaiting payment (status=${order.status})`);
    }

    const intent = await this.gateway.createPixPayment({
      orderId: order.id.toString(),
      orderNumber: order.number,
      amountCents: order.grandTotal,
      customerEmail: order.customerSnapshot.email,
      customerName: order.customerSnapshot.name,
    });

    const payment = new PaymentEntity({
      orderId: order.id,
      method: 'PIX',
      provider: this.gateway.providerName,
      providerTxId: intent.providerTxId,
      status: intent.status,
      amount: order.grandTotal,
      qrCode: intent.qrCode,
      qrCodeBase64: intent.qrCodeBase64,
      expiresAt: intent.expiresAt,
      raw: intent.raw,
    });
    await this.paymentRepository.create(payment);

    return {
      paymentId: payment.id.toString(),
      providerTxId: payment.providerTxId,
      status: payment.status,
      qrCode: payment.qrCode,
      qrCodeBase64: payment.qrCodeBase64,
      expiresAt: payment.expiresAt,
      amountCents: payment.amount,
    };
  }
}
