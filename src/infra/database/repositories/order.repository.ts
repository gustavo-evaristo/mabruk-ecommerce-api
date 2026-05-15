import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import {
  IOrderRepository,
  OrderDetails,
  OrderListFilters,
  OrderListResult,
} from 'src/domain/repositories/order.repository';
import { OrderEntity, OrderStatus } from 'src/domain/entities/order.entity';
import { OrderItemEntity } from 'src/domain/entities/order-item.entity';
import { PaymentEntity, PaymentMethod, PaymentStatus } from 'src/domain/entities/payment.entity';
import { ShipmentEntity } from 'src/domain/entities/shipment.entity';
import { UUID } from 'src/domain/entities/vos';

@Injectable()
export class OrderRepository implements IOrderRepository {
  constructor(private readonly prisma: PrismaService) {}

  private toOrderEntity(row: any): OrderEntity {
    return new OrderEntity({
      id: UUID.from(row.id),
      number: row.number,
      customerId: row.customerId ? UUID.from(row.customerId) : null,
      customerSnapshot: row.customerSnapshot,
      status: row.status as OrderStatus,
      itemsTotal: row.itemsTotal,
      shippingTotal: row.shippingTotal,
      discountTotal: row.discountTotal,
      grandTotal: row.grandTotal,
      shippingAddress: row.shippingAddress,
      invoiceNumber: row.invoiceNumber,
      notes: row.notes,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    });
  }

  private toItemEntity(row: any): OrderItemEntity {
    return new OrderItemEntity({
      id: UUID.from(row.id),
      orderId: UUID.from(row.orderId),
      variantId: UUID.from(row.variantId),
      productSnapshot: row.productSnapshot,
      unitPrice: row.unitPrice,
      quantity: row.quantity,
      lineTotal: row.lineTotal,
    });
  }

  private toPaymentEntity(row: any): PaymentEntity {
    return new PaymentEntity({
      id: UUID.from(row.id),
      orderId: UUID.from(row.orderId),
      method: row.method as PaymentMethod,
      provider: row.provider,
      providerTxId: row.providerTxId,
      status: row.status as PaymentStatus,
      installments: row.installments,
      amount: row.amount,
      qrCode: row.qrCode,
      qrCodeBase64: row.qrCodeBase64,
      expiresAt: row.expiresAt,
      paidAt: row.paidAt,
      raw: row.raw,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    });
  }

  private toShipmentEntity(row: any): ShipmentEntity {
    return new ShipmentEntity({
      id: UUID.from(row.id),
      orderId: UUID.from(row.orderId),
      carrier: row.carrier,
      service: row.service,
      externalOrderId: row.externalOrderId,
      trackingCode: row.trackingCode,
      cost: row.cost,
      estimatedDays: row.estimatedDays,
      shippedAt: row.shippedAt,
      deliveredAt: row.deliveredAt,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    });
  }

  async createWithItems(order: OrderEntity, items: OrderItemEntity[]): Promise<void> {
    await this.prisma.$transaction([
      this.prisma.orders.create({
        data: {
          id: order.id.toString(),
          number: order.number,
          customerId: order.customerId?.toString() ?? null,
          customerSnapshot: order.customerSnapshot as any,
          status: order.status,
          itemsTotal: order.itemsTotal,
          shippingTotal: order.shippingTotal,
          discountTotal: order.discountTotal,
          grandTotal: order.grandTotal,
          shippingAddress: order.shippingAddress as any,
          invoiceNumber: order.invoiceNumber,
          notes: order.notes,
          createdAt: order.createdAt,
          updatedAt: order.updatedAt,
        },
      }),
      this.prisma.order_items.createMany({
        data: items.map((i) => ({
          id: i.id.toString(),
          orderId: order.id.toString(),
          variantId: i.variantId.toString(),
          productSnapshot: i.productSnapshot as any,
          unitPrice: i.unitPrice,
          quantity: i.quantity,
          lineTotal: i.lineTotal,
        })),
      }),
    ]);
  }

  async get(id: string): Promise<OrderEntity | null> {
    const row = await this.prisma.orders.findUnique({ where: { id } });
    return row ? this.toOrderEntity(row) : null;
  }

  async findByNumber(number: string): Promise<OrderEntity | null> {
    const row = await this.prisma.orders.findUnique({ where: { number } });
    return row ? this.toOrderEntity(row) : null;
  }

  async getDetailsByNumber(number: string): Promise<OrderDetails | null> {
    const row = await this.prisma.orders.findUnique({
      where: { number },
      include: { items: true, payments: true, shipment: true },
    });
    if (!row) return null;
    return {
      order: this.toOrderEntity(row),
      items: row.items.map((i) => this.toItemEntity(i)),
      payments: row.payments.map((p) => this.toPaymentEntity(p)),
      shipment: row.shipment ? this.toShipmentEntity(row.shipment) : null,
    };
  }

  async getDetailsById(id: string): Promise<OrderDetails | null> {
    const row = await this.prisma.orders.findUnique({
      where: { id },
      include: { items: true, payments: true, shipment: true },
    });
    if (!row) return null;
    return {
      order: this.toOrderEntity(row),
      items: row.items.map((i) => this.toItemEntity(i)),
      payments: row.payments.map((p) => this.toPaymentEntity(p)),
      shipment: row.shipment ? this.toShipmentEntity(row.shipment) : null,
    };
  }

  async list(filters: OrderListFilters): Promise<OrderListResult> {
    const page = filters.page ?? 1;
    const pageSize = filters.pageSize ?? 20;
    const where: any = {};
    if (filters.status) where.status = Array.isArray(filters.status) ? { in: filters.status } : filters.status;
    if (filters.customerId) where.customerId = filters.customerId;
    if (filters.from || filters.to) {
      where.createdAt = {};
      if (filters.from) where.createdAt.gte = filters.from;
      if (filters.to) where.createdAt.lte = filters.to;
    }
    if (filters.search) {
      where.OR = [
        { number: { contains: filters.search, mode: 'insensitive' } },
        { customerSnapshot: { path: ['email'], string_contains: filters.search } },
        { customerSnapshot: { path: ['name'], string_contains: filters.search } },
      ];
    }
    const [rows, total] = await Promise.all([
      this.prisma.orders.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      this.prisma.orders.count({ where }),
    ]);
    return { items: rows.map((r) => this.toOrderEntity(r)), total };
  }

  async update(order: OrderEntity): Promise<void> {
    await this.prisma.orders.update({
      where: { id: order.id.toString() },
      data: {
        status: order.status,
        invoiceNumber: order.invoiceNumber,
        notes: order.notes,
        shippingTotal: order.shippingTotal,
        discountTotal: order.discountTotal,
        grandTotal: order.grandTotal,
        updatedAt: order.updatedAt,
      },
    });
  }

  async nextOrderNumber(): Promise<string> {
    // Sequência humana: MBK-XXXXXX. Conta total de pedidos + 1 (não importa concorrência exata
    // — a unicidade é garantida por @unique no schema; em colisão o use case re-tenta).
    const count = await this.prisma.orders.count();
    const next = count + 1;
    return `MBK-${String(next).padStart(6, '0')}`;
  }

  async dashboardSummary({ from, to }: { from: Date; to: Date }) {
    const whereSold = {
      createdAt: { gte: from, lte: to },
      status: { in: ['PAID', 'PREPARING', 'SHIPPED', 'DELIVERED'] },
    };
    const [agg, ordersCount, pendingCount] = await Promise.all([
      this.prisma.orders.aggregate({
        where: whereSold,
        _sum: { grandTotal: true },
        _count: true,
      }),
      this.prisma.orders.count({ where: { createdAt: { gte: from, lte: to } } }),
      this.prisma.orders.count({
        where: { status: { in: ['PENDING_PAYMENT', 'PAID', 'PREPARING'] } },
      }),
    ]);
    const salesTotalCents = agg._sum.grandTotal ?? 0;
    const soldCount = agg._count ?? 0;
    return {
      salesTotalCents,
      ordersCount,
      averageTicketCents: soldCount > 0 ? Math.round(salesTotalCents / soldCount) : 0,
      pendingOrdersCount: pendingCount,
    };
  }

  async topSellingVariants({ from, to, limit }: { from: Date; to: Date; limit: number }) {
    const grouped = await this.prisma.order_items.groupBy({
      by: ['variantId'],
      where: {
        order: {
          status: { in: ['PAID', 'PREPARING', 'SHIPPED', 'DELIVERED'] },
          createdAt: { gte: from, lte: to },
        },
      },
      _sum: { quantity: true },
      orderBy: { _sum: { quantity: 'desc' } },
      take: limit,
    });
    if (grouped.length === 0) return [];
    const variants = await this.prisma.product_variants.findMany({
      where: { id: { in: grouped.map((g) => g.variantId) } },
      include: { product: true },
    });
    return grouped.map((g) => {
      const v = variants.find((x) => x.id === g.variantId);
      return {
        variantId: g.variantId,
        productId: v?.productId ?? '',
        productName: v?.product?.name ?? '',
        quantity: g._sum.quantity ?? 0,
      };
    });
  }
}
