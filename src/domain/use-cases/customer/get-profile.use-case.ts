import { Injectable, NotFoundException } from '@nestjs/common';
import { ICustomerRepository } from 'src/domain/repositories/customer.repository';
import { CustomerEntity } from 'src/domain/entities/customer.entity';

@Injectable()
export class GetCustomerProfileUseCase {
  constructor(private readonly customerRepository: ICustomerRepository) {}

  async execute(id: string): Promise<CustomerEntity> {
    const c = await this.customerRepository.get(id);
    if (!c) throw new NotFoundException('Customer not found');
    return c;
  }
}
