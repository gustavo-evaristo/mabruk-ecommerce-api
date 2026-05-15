import { Injectable } from '@nestjs/common';
import { IOrderRepository } from 'src/domain/repositories/order.repository';

@Injectable()
export class GetMyOrdersUseCase {
  constructor(private readonly orderRepository: IOrderRepository) {}

  async execute(customerId: string, page = 1, pageSize = 10) {
    return this.orderRepository.list({ customerId, page, pageSize });
  }
}
