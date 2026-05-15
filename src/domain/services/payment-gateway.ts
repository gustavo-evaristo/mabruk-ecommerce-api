export interface CreatePixInput {
  orderId: string;
  orderNumber: string;
  amountCents: number;
  customerEmail: string;
  customerName: string;
  expirationMinutes?: number;
}

export interface CreateCardInput {
  orderId: string;
  orderNumber: string;
  amountCents: number;
  installments: number;
  cardToken: string;
  customer: { email: string; name: string; cpf?: string };
}

export interface PaymentIntent {
  providerTxId: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  qrCode?: string;
  qrCodeBase64?: string;
  expiresAt?: Date;
  installments?: number;
  raw?: unknown;
}

export interface WebhookSignal {
  providerTxId: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'REFUNDED';
  raw?: unknown;
}

export abstract class PaymentGateway {
  abstract readonly providerName: string;
  abstract createPixPayment(input: CreatePixInput): Promise<PaymentIntent>;
  abstract createCardPayment(input: CreateCardInput): Promise<PaymentIntent>;
  abstract refund(providerTxId: string, amountCents?: number): Promise<{ ok: boolean }>;
  abstract parseWebhook(headers: Record<string, string>, body: unknown): Promise<WebhookSignal>;
}
