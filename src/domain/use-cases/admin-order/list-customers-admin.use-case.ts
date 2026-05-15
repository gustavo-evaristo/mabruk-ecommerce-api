import { Injectable } from '@nestjs/common';
import { ICustomerRepository } from 'src/domain/repositories/customer.repository';

@Injectable()
export class ListCustomersAdminUseCase {
  constructor(private readonly customerRepository: ICustomerRepository) {}

  async execute(input: { search?: string; page?: number; pageSize?: number }) {
    return this.customerRepository.list({
      ...input,
      pageSize: Math.min(input.pageSize ?? 30, 100),
    });
  }
}
