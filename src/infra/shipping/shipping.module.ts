import { Module } from '@nestjs/common';
import { ShippingCalculator } from 'src/domain/services/shipping-calculator';
import { FixedShippingCalculator } from './fixed-shipping.calculator';

@Module({
  providers: [{ provide: ShippingCalculator, useClass: FixedShippingCalculator }],
  exports: [ShippingCalculator],
})
export class ShippingModule {}
