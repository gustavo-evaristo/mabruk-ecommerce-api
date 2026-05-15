import { Module } from '@nestjs/common';
import { DatabaseModule } from '../database/database.module';
import { AuthenticationModule } from '../authentication/authentication.module';
import { MailModule } from '../mail/mail.module';
import { AdminOrdersController } from './b2b/order/admin-orders.controller';
import { AdminCustomersController } from './b2b/admin-customers.controller';
import { AdminDashboardController } from './b2b/admin-dashboard.controller';
import {
  AttachInvoiceUseCase,
  AttachTrackingUseCase,
  GetDashboardUseCase,
  GetOrderAdminUseCase,
  ListCustomersAdminUseCase,
  ListOrdersAdminUseCase,
  UpdateOrderStatusUseCase,
} from 'src/domain/use-cases/admin-order';

@Module({
  imports: [DatabaseModule, AuthenticationModule, MailModule],
  providers: [
    ListOrdersAdminUseCase,
    GetOrderAdminUseCase,
    UpdateOrderStatusUseCase,
    AttachInvoiceUseCase,
    AttachTrackingUseCase,
    ListCustomersAdminUseCase,
    GetDashboardUseCase,
  ],
  controllers: [AdminOrdersController, AdminCustomersController, AdminDashboardController],
})
export class AdminOrderModule {}
