import { Module } from '@nestjs/common';
import { ProductsController } from './products.controller';
import { ListProductsUseCase } from '../../../domain/use-cases/products/list-products.use-case';
import { GetProductUseCase } from '../../../domain/use-cases/products/get-product.use-case';
import { UpdateProductFlagsUseCase } from '../../../domain/use-cases/products/update-product-flags.use-case';
import { DatabaseModule } from '../../database/database.module';

@Module({
  imports: [DatabaseModule],
  controllers: [ProductsController],
  providers: [ListProductsUseCase, GetProductUseCase, UpdateProductFlagsUseCase],
  exports: [UpdateProductFlagsUseCase],
})
export class ProductsModule {}
