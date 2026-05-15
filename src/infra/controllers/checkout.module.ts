import { Module } from '@nestjs/common';
import { DatabaseModule } from '../database/database.module';
import { AuthenticationModule } from '../authentication/authentication.module';
import { ShippingModule } from '../shipping/shipping.module';
import { MailModule } from '../mail/mail.module';
import { ShippingController } from './b2c/checkout/shipping.controller';
import { CheckoutController } from './b2c/checkout/checkout.controller';
import { OrdersController } from './b2c/order/orders.controller';
import {
  CreateOrderFromCartUseCase,
  QuoteShippingUseCase,
} from 'src/domain/use-cases/checkout';
import {
  GetMyOrdersUseCase,
  GetOrderByNumberUseCase,
} from 'src/domain/use-cases/order';

@Module({
  imports: [DatabaseModule, AuthenticationModule, ShippingModule, MailModule],
  providers: [
    QuoteShippingUseCase,
    CreateOrderFromCartUseCase,
    GetMyOrdersUseCase,
    GetOrderByNumberUseCase,
  ],
  controllers: [ShippingController, CheckoutController, OrdersController],
})
export class CheckoutModule {}
