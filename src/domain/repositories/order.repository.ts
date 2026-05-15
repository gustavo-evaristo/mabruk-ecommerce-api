import { OrderEntity, OrderStatus } from '../entities/order.entity';
import { OrderItemEntity } from '../entities/order-item.entity';
import { PaymentEntity } from '../entities/payment.entity';
import { ShipmentEntity } from '../entities/shipment.entity';

export interface OrderDetails {
  order: OrderEntity;
  items: OrderItemEntity[];
  payments: PaymentEntity[];
  shipment: ShipmentEntity | null;
}

export interface OrderListFilters {
  status?: OrderStatus | OrderStatus[];
  customerId?: string;
  search?: string;
  from?: Date;
  to?: Date;
  page?: number;
  pageSize?: number;
}

export interface OrderListResult {
  items: OrderEntity[];
  total: number;
}

export abstract class IOrderRepository {
  abstract createWithItems(order: OrderEntity, items: OrderItemEntity[]): Promise<void>;
  abstract get(id: string): Promise<OrderEntity | null>;
  abstract findByNumber(number: string): Promise<OrderEntity | null>;
  abstract getDetailsByNumber(number: string): Promise<OrderDetails | null>;
  abstract getDetailsById(id: string): Promise<OrderDetails | null>;
  abstract list(filters: OrderListFilters): Promise<OrderListResult>;
  abstract update(order: OrderEntity): Promise<void>;
  abstract nextOrderNumber(): Promise<string>;

  /**
   * Métricas para dashboard (totais agregados).
   */
  abstract dashboardSummary(input: { from: Date; to: Date }): Promise<{
    salesTotalCents: number;
    ordersCount: number;
    averageTicketCents: number;
    pendingOrdersCount: number;
  }>;
  abstract topSellingVariants(input: { from: Date; to: Date; limit: number }): Promise<
    { variantId: string; productId: string; productName: string; quantity: number }[]
  >;
}
