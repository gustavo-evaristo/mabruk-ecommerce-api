import { Injectable, NotFoundException } from '@nestjs/common';
import { IOrderRepository, OrderDetails } from 'src/domain/repositories/order.repository';

@Injectable()
export class GetOrderAdminUseCase {
  constructor(private readonly orderRepository: IOrderRepository) {}

  async execute(id: string): Promise<OrderDetails> {
    const details = await this.orderRepository.getDetailsById(id);
    if (!details) throw new NotFoundException('Order not found');
    return details;
  }
}
