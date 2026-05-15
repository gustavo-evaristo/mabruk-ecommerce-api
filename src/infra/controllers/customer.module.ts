import { Module } from '@nestjs/common';
import { DatabaseModule } from '../database/database.module';
import { AuthenticationModule } from '../authentication/authentication.module';
import { CustomersController } from './b2c/customer/customers.controller';
import { AddressesController } from './b2c/customer/addresses.controller';
import {
  ChangeCustomerPasswordUseCase,
  CreateCustomerAddressUseCase,
  DeleteCustomerAddressUseCase,
  GetCustomerProfileUseCase,
  ListCustomerAddressesUseCase,
  LoginCustomerUseCase,
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
  ],
  controllers: [CustomersController, AddressesController],
})
export class CustomerModule {}
