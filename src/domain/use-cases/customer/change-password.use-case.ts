import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { ICustomerRepository } from 'src/domain/repositories/customer.repository';
import { Password } from 'src/domain/entities/vos';

interface Input {
  customerId: string;
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

@Injectable()
export class ChangeCustomerPasswordUseCase {
  constructor(private readonly customerRepository: ICustomerRepository) {}

  async execute(input: Input): Promise<void> {
    const c = await this.customerRepository.get(input.customerId);
    if (!c) throw new NotFoundException('Customer not found');

    const ok = Password.create(input.currentPassword).compareWithHash(c.password.value);
    if (!ok) throw new UnauthorizedException('Senha atual incorreta');

    Password.createWithConfirmation(input.newPassword, input.confirmPassword);
    c.changePassword(input.newPassword);
    await this.customerRepository.update(c);
  }
}
