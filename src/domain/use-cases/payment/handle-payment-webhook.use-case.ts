import { Injectable, Logger } from '@nestjs/common';
import { IPaymentRepository } from 'src/domain/repositories/payment.repository';
import { PaymentGateway } from 'src/domain/services/payment-gateway';
import { SettleOrderPaymentUseCase } from './settle-order-payment.use-case';

interface Input {
  headers: Record<string, string>;
  body: unknown;
}

@Injectable()
export class HandlePaymentWebhookUseCase {
  private readonly logger = new Logger(HandlePaymentWebhookUseCase.name);

  constructor(
    private readonly gateway: PaymentGateway,
    private readonly paymentRepository: IPaymentRepository,
    private readonly settle: SettleOrderPaymentUseCase,
  ) {}

  async execute(input: Input): Promise<{ ok: boolean }> {
    const signal = await this.gateway.parseWebhook(input.headers, input.body);
    const payment = await this.paymentRepository.findByProviderTxId(signal.providerTxId);
    if (!payment) {
      this.logger.warn(`Webhook recebido para tx desconhecida: ${signal.providerTxId}`);
      return { ok: true };
    }

    if (signal.status === 'APPROVED') {
      await this.settle.execute({ providerTxId: signal.providerTxId });
    } else if (signal.status === 'REJECTED') {
      payment.reject();
      await this.paymentRepository.update(payment);
    } else if (signal.status === 'REFUNDED') {
      payment.refund();
      await this.paymentRepository.update(payment);
    }

    return { ok: true };
  }
}
