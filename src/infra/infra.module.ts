import { Module } from '@nestjs/common';
import { DatabaseModule } from './database/database.module';
import { AuthenticationModule } from './authentication/authentication.module';
import { PaymentModule } from './payment/payment.module';
import { ShippingModule } from './shipping/shipping.module';
import { MailModule } from './mail/mail.module';
import { StorageModule } from './storage/storage.module';

// Feature modules
import { CatalogModule } from './controllers/catalog.module';
import { CustomerModule } from './controllers/customer.module';
import { AdminAuthModule } from './controllers/admin-auth.module';
import { CartModule } from './controllers/cart.module';
import { CheckoutModule } from './controllers/checkout.module';
import { PaymentControllerModule } from './controllers/payment.module';
import { AdminOrderModule } from './controllers/admin-order.module';
import { UtilsModule } from './controllers/utils.module';
import { HealthController } from './controllers/health.controller';

@Module({
  imports: [
    // Infraestrutura
    DatabaseModule,
    AuthenticationModule,
    PaymentModule,
    ShippingModule,
    MailModule,
    StorageModule,
    // Features
    CatalogModule,
    CustomerModule,
    AdminAuthModule,
    CartModule,
    CheckoutModule,
    PaymentControllerModule,
    AdminOrderModule,
    UtilsModule,
  ],
  controllers: [HealthController],
})
export class InfraModule {}
