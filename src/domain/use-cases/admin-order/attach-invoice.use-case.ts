import { Injectable, NotFoundException } from '@nestjs/common';
import { IOrderRepository } from 'src/domain/repositories/order.repository';

@Injectable()
export class AttachInvoiceUseCase {
  constructor(private readonly orderRepository: IOrderRepository) {}

  async execute(orderId: string, invoiceNumber: string) {
    const order = await this.orderRepository.get(orderId);
    if (!order) throw new NotFoundException('Order not found');
    order.attachInvoice(invoiceNumber);
    await this.orderRepository.update(order);
    return order;
  }
}
