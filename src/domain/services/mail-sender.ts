export type MailTemplate =
  | 'order_created'
  | 'payment_approved'
  | 'order_shipped'
  | 'order_delivered'
  | 'password_reset';

export interface SendMailInput {
  to: string;
  template: MailTemplate;
  data: Record<string, unknown>;
}

export abstract class MailSender {
  abstract readonly providerName: string;
  abstract send(input: SendMailInput): Promise<void>;
}
