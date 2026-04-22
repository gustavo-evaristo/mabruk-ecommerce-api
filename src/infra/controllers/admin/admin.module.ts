import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { UpdateProductFlagsUseCase } from '../../../domain/use-cases/products/update-product-flags.use-case';
import { DatabaseModule } from '../../database/database.module';

@Module({
  imports: [DatabaseModule],
  controllers: [AdminController],
  providers: [UpdateProductFlagsUseCase],
})
export class AdminModule {}
