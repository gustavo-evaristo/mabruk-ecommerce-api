import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { IOrderRepository } from 'src/domain/repositories/order.repository';
import { IPaymentRepository } from 'src/domain/repositories/payment.repository';
import { PaymentGateway } from 'src/domain/services/payment-gateway';
import { PaymentEntity } from 'src/domain/entities/payment.entity';
import { SettleOrderPaymentUseCase } from './settle-order-payment.use-case';

interface Input {
  orderId: string;
  cardToken: string;
  installments: number;
}

@Injectable()
export class CreateCardPaymentUseCase {
  constructor(
    private readonly orderRepository: IOrderRepository,
    private readonly paymentRepository: IPaymentRepository,
    private readonly gateway: PaymentGateway,
    private readonly settle: SettleOrderPaymentUseCase,
  ) {}

  async execute(input: Input) {
    const order = await this.orderRepository.get(input.orderId);
    if (!order) throw new NotFoundException('Order not found');
    if (order.status !== 'PENDING_PAYMENT') {
      throw new BadRequestException(`Order not awaiting payment (status=${order.status})`);
    }
    const maxInstallments = Number(process.env.MAX_INSTALLMENTS_NO_INTEREST ?? 2);
    if (input.installments < 1 || input.installments > maxInstallments) {
      throw new BadRequestException(`Parcelamento entre 1 e ${maxInstallments}x`);
    }

    const intent = await this.gateway.createCardPayment({
      orderId: order.id.toString(),
      orderNumber: order.number,
      amountCents: order.grandTotal,
      cardToken: input.cardToken,
      installments: input.installments,
      customer: { email: order.customerSnapshot.email, name: order.customerSnapshot.name },
    });

    const payment = new PaymentEntity({
      orderId: order.id,
      method: 'CREDIT_CARD',
      provider: this.gateway.providerName,
      providerTxId: intent.providerTxId,
      status: intent.status,
      installments: input.installments,
      amount: order.grandTotal,
      raw: intent.raw,
    });
    await this.paymentRepository.create(payment);

    // Cartão pode aprovar na hora — neste caso já liquida (decrementa estoque + e-mail)
    if (intent.status === 'APPROVED') {
      await this.settle.execute({ providerTxId: payment.providerTxId });
    }

    return {
      paymentId: payment.id.toString(),
      status: payment.status,
      installments: payment.installments,
    };
  }
}
