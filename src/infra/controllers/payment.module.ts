import { Module } from '@nestjs/common';
import { DatabaseModule } from '../database/database.module';
import { PaymentModule as PaymentInfraModule } from '../payment/payment.module';
import { MailModule } from '../mail/mail.module';
import {
  PaymentsController,
  WebhookController,
} from './b2c/payment/payments.controller';
import {
  CreateCardPaymentUseCase,
  CreatePixPaymentUseCase,
  HandlePaymentWebhookUseCase,
  SettleOrderPaymentUseCase,
} from 'src/domain/use-cases/payment';

@Module({
  imports: [DatabaseModule, PaymentInfraModule, MailModule],
  providers: [
    CreatePixPaymentUseCase,
    CreateCardPaymentUseCase,
    SettleOrderPaymentUseCase,
    HandlePaymentWebhookUseCase,
  ],
  controllers: [PaymentsController, WebhookController],
})
export class PaymentControllerModule {}
