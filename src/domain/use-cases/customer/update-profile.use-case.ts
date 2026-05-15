import { Injectable, NotFoundException } from '@nestjs/common';
import { ICustomerRepository } from 'src/domain/repositories/customer.repository';
import { CustomerEntity } from 'src/domain/entities/customer.entity';

interface Input {
  id: string;
  name?: string;
  phone?: string | null;
  cpfCnpj?: string | null;
}

@Injectable()
export class UpdateCustomerProfileUseCase {
  constructor(private readonly customerRepository: ICustomerRepository) {}

  async execute(input: Input): Promise<CustomerEntity> {
    const c = await this.customerRepository.get(input.id);
    if (!c) throw new NotFoundException('Customer not found');
    c.updateProfile({ name: input.name, phone: input.phone, cpfCnpj: input.cpfCnpj });
    await this.customerRepository.update(c);
    return c;
  }
}
