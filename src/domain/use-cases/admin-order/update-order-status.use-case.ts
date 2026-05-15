import { Injectable, NotFoundException } from '@nestjs/common';
import { IOrderRepository } from 'src/domain/repositories/order.repository';
import { OrderEntity, OrderStatus } from 'src/domain/entities/order.entity';
import { MailSender, MailTemplate } from 'src/domain/services/mail-sender';

interface Input {
  id: string;
  status: OrderStatus;
}

const TEMPLATE_BY_STATUS: Partial<Record<OrderStatus, MailTemplate>> = {
  SHIPPED: 'order_shipped',
  DELIVERED: 'order_delivered',
};

@Injectable()
export class UpdateOrderStatusUseCase {
  constructor(
    private readonly orderRepository: IOrderRepository,
    private readonly mailSender: MailSender,
  ) {}

  async execute(input: Input): Promise<OrderEntity> {
    const order = await this.orderRepository.get(input.id);
    if (!order) throw new NotFoundException('Order not found');

    order.transitionTo(input.status);
    await this.orderRepository.update(order);

    const template = TEMPLATE_BY_STATUS[input.status];
    if (template) {
      try {
        await this.mailSender.send({
          to: order.customerSnapshot.email,
          template,
          data: {
            customerName: order.customerSnapshot.name,
            orderNumber: order.number,
          },
        });
      } catch {
        /* ok */
      }
    }
    return order;
  }
}
