import { CustomerEntity } from '../entities/customer.entity';

export abstract class ICustomerRepository {
  abstract get(id: string): Promise<CustomerEntity | null>;
  abstract findByEmail(email: string): Promise<CustomerEntity | null>;
  abstract create(customer: CustomerEntity): Promise<void>;
  abstract update(customer: CustomerEntity): Promise<void>;
  abstract list(input: { search?: string; page?: number; pageSize?: number }): Promise<{
    items: CustomerEntity[];
    total: number;
  }>;
}
