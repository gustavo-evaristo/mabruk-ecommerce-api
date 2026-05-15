import { Injectable } from '@nestjs/common';
import { IOrderRepository } from 'src/domain/repositories/order.repository';
import { OrderStatus } from 'src/domain/entities/order.entity';

interface Input {
  status?: OrderStatus;
  search?: string;
  from?: Date;
  to?: Date;
  page?: number;
  pageSize?: number;
}

@Injectable()
export class ListOrdersAdminUseCase {
  constructor(private readonly orderRepository: IOrderRepository) {}

  async execute(input: Input) {
    return this.orderRepository.list({
      ...input,
      pageSize: Math.min(input.pageSize ?? 30, 100),
    });
  }
}
