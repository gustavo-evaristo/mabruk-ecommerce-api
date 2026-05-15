import { Injectable, Logger } from '@nestjs/common';
import { randomUUID } from 'crypto';
import {
  CreateCardInput,
  CreatePixInput,
  PaymentGateway,
  PaymentIntent,
  WebhookSignal,
} from 'src/domain/services/payment-gateway';

/**
 * Implementação fake do PaymentGateway para o MVP.
 *
 * Comportamento:
 * - PIX: gera providerTxId aleatório, QR code dummy e expiresAt em 30min.
 * - Cartão: sempre aprova (a menos que o token contenha "fail").
 * - Webhook: lê body { providerTxId, status } direto.
 *
 * Quando integrar Mercado Pago, basta trocar `{ useClass: FakePaymentGateway }`
 * por `{ useClass: MercadoPagoPaymentGateway }` no PaymentModule.
 */
@Injectable()
export class FakePaymentGateway extends PaymentGateway {
  readonly providerName = 'fake';
  private readonly logger = new Logger(FakePaymentGateway.name);

  async createPixPayment(input: CreatePixInput): Promise<PaymentIntent> {
    const providerTxId = `pix_${randomUUID()}`;
    const minutes = input.expirationMinutes ?? 30;
    const expiresAt = new Date(Date.now() + minutes * 60_000);
    const qrCode = `MABRUK|PIX|${input.orderNumber}|${input.amountCents}|${providerTxId}`;
    const qrCodeBase64 = Buffer.from(qrCode).toString('base64');
    this.logger.log(
      `[FakeGateway] PIX criado: order=${input.orderNumber} amount=${input.amountCents} txId=${providerTxId}`,
    );
    return {
      providerTxId,
      status: 'PENDING',
      qrCode,
      qrCodeBase64,
      expiresAt,
      raw: { fake: true },
    };
  }

  async createCardPayment(input: CreateCardInput): Promise<PaymentIntent> {
    const providerTxId = `card_${randomUUID()}`;
    const approved = !input.cardToken.toLowerCase().includes('fail');
    this.logger.log(
      `[FakeGateway] Card ${approved ? 'aprovado' : 'recusado'}: order=${input.orderNumber} amount=${input.amountCents} parcelas=${input.installments}`,
    );
    return {
      providerTxId,
      status: approved ? 'APPROVED' : 'REJECTED',
      installments: input.installments,
      raw: { fake: true },
    };
  }

  async refund(providerTxId: string): Promise<{ ok: boolean }> {
    this.logger.log(`[FakeGateway] Refund simulado para ${providerTxId}`);
    return { ok: true };
  }

  async parseWebhook(
    _headers: Record<string, string>,
    body: unknown,
  ): Promise<WebhookSignal> {
    const b = body as { providerTxId?: string; status?: string };
    if (!b?.providerTxId || !b?.status) {
      throw new Error('Invalid webhook payload (need { providerTxId, status })');
    }
    return {
      providerTxId: b.providerTxId,
      status: b.status as WebhookSignal['status'],
      raw: body,
    };
  }
}
