import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { IOrderRepository, OrderDetails } from 'src/domain/repositories/order.repository';

interface Input {
  number: string;
  customerId?: string;
  guestEmail?: string;
}

@Injectable()
export class GetOrderByNumberUseCase {
  constructor(private readonly orderRepository: IOrderRepository) {}

  async execute(input: Input): Promise<OrderDetails> {
    const details = await this.orderRepository.getDetailsByNumber(input.number);
    if (!details) throw new NotFoundException('Order not found');

    // Cliente logado: o customerId precisa bater
    if (input.customerId) {
      if (details.order.customerId?.toString() !== input.customerId) {
        throw new ForbiddenException();
      }
      return details;
    }

    // Guest: valida pelo email do snapshot
    if (input.guestEmail) {
      const snap = details.order.customerSnapshot;
      if (snap.email.toLowerCase() !== input.guestEmail.toLowerCase()) {
        throw new ForbiddenException();
      }
      return details;
    }

    throw new ForbiddenException('Informe customerId ou email');
  }
}
