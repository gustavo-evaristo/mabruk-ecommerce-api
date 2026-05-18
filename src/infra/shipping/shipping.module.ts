import { Module } from '@nestjs/common';
import { ShippingCalculator } from 'src/domain/services/shipping-calculator';
import { FixedShippingCalculator } from './fixed-shipping.calculator';
import { DatabaseModule } from '../database/database.module';

@Module({
  imports: [DatabaseModule],
  providers: [{ provide: ShippingCalculator, useClass: FixedShippingCalculator }],
  exports: [ShippingCalculator],
})
export class ShippingModule {}
