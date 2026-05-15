import { Injectable, NotFoundException } from '@nestjs/common';
import { IOrderRepository } from 'src/domain/repositories/order.repository';
import { IShipmentRepository } from 'src/domain/repositories/shipment.repository';

interface Input {
  orderId: string;
  trackingCode: string;
  carrier?: string;
}

@Injectable()
export class AttachTrackingUseCase {
  constructor(
    private readonly orderRepository: IOrderRepository,
    private readonly shipmentRepository: IShipmentRepository,
  ) {}

  async execute(input: Input) {
    const order = await this.orderRepository.get(input.orderId);
    if (!order) throw new NotFoundException('Order not found');

    const shipment = await this.shipmentRepository.findByOrderId(input.orderId);
    if (!shipment) throw new NotFoundException('Shipment not found');

    shipment.attachTracking(input.trackingCode, input.carrier);
    await this.shipmentRepository.upsert(shipment);
    return shipment;
  }
}
