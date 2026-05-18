import { Module } from '@nestjs/common';
import { DatabaseModule } from '../database/database.module';
import { AuthenticationModule } from '../authentication/authentication.module';
import { CustomersController } from './b2c/customer/customers.controller';
import { AddressesController } from './b2c/customer/addresses.controller';
import { FavoritesController } from './b2c/customer/favorites.controller';
import {
  AddFavoriteUseCase,
  ChangeCustomerPasswordUseCase,
  CreateCustomerAddressUseCase,
  DeleteCustomerAddressUseCase,
  GetCustomerProfileUseCase,
  ListCustomerAddressesUseCase,
  ListCustomerFavoritesUseCase,
  LoginCustomerUseCase,
  RemoveFavoriteUseCase,
  SignupCustomerUseCase,
  UpdateCustomerAddressUseCase,
  UpdateCustomerProfileUseCase,
} from 'src/domain/use-cases/customer';

@Module({
  imports: [DatabaseModule, AuthenticationModule],
  providers: [
    SignupCustomerUseCase,
    LoginCustomerUseCase,
    GetCustomerProfileUseCase,
    UpdateCustomerProfileUseCase,
    ChangeCustomerPasswordUseCase,
    ListCustomerAddressesUseCase,
    CreateCustomerAddressUseCase,
    UpdateCustomerAddressUseCase,
    DeleteCustomerAddressUseCase,
    ListCustomerFavoritesUseCase,
    AddFavoriteUseCase,
    RemoveFavoriteUseCase,
  ],
  controllers: [CustomersController, AddressesController, FavoritesController],
})
export class CustomerModule {}
