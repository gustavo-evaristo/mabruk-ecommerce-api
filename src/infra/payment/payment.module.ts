import { Module } from '@nestjs/common';
import { PaymentGateway } from 'src/domain/services/payment-gateway';
import { FakePaymentGateway } from './fake-payment.gateway';

@Module({
  providers: [{ provide: PaymentGateway, useClass: FakePaymentGateway }],
  exports: [PaymentGateway],
})
export class PaymentModule {}
