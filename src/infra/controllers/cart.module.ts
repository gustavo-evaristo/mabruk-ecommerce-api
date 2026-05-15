import { Module } from '@nestjs/common';
import { DatabaseModule } from '../database/database.module';
import { AuthenticationModule } from '../authentication/authentication.module';
import { CartController } from './b2c/cart/cart.controller';
import {
  AddCartItemUseCase,
  CreateCartUseCase,
  GetCartUseCase,
  RemoveCartItemUseCase,
  UpdateCartItemUseCase,
} from 'src/domain/use-cases/cart';

@Module({
  imports: [DatabaseModule, AuthenticationModule],
  providers: [
    CreateCartUseCase,
    GetCartUseCase,
    AddCartItemUseCase,
    UpdateCartItemUseCase,
    RemoveCartItemUseCase,
  ],
  controllers: [CartController],
})
export class CartModule {}
