import { Controller, Get, Param, Query, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CustomerJwtGuard } from 'src/infra/authentication/customer-jwt.guard';
import { AuthenticatedCustomerRequest } from 'src/infra/authentication/types';
import {
  GetMyOrdersUseCase,
  GetOrderByNumberUseCase,
} from 'src/domain/use-cases/order';

const presentOrder = (o: any) => ({
  id: o.id.toString(),
  number: o.number,
  status: o.status,
  itemsTotalCents: o.itemsTotal,
  shippingTotalCents: o.shippingTotal,
  grandTotalCents: o.grandTotal,
  createdAt: o.createdAt,
  customer: o.customerSnapshot,
});

@ApiTags('B2C / Orders')
@Controller('b2c/orders')
export class OrdersController {
  constructor(
    private readonly listMyUC: GetMyOrdersUseCase,
    private readonly getByNumberUC: GetOrderByNumberUseCase,
  ) {}

  @Get('me')
  @UseGuards(CustomerJwtGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Lista pedidos do cliente logado' })
  async myOrders(
    @Req() req: AuthenticatedCustomerRequest,
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
  ) {
    const result = await this.listMyUC.execute(
      req.user.id,
      page ? Number(page) : 1,
      pageSize ? Number(pageSize) : 10,
    );
    return {
      items: result.items.map(presentOrder),
      total: result.total,
    };
  }

  @Get('me/:number')
  @UseGuards(CustomerJwtGuard)
  @ApiBearerAuth()
  async myOrderByNumber(
    @Req() req: AuthenticatedCustomerRequest,
    @Param('number') number: string,
  ) {
    const details = await this.getByNumberUC.execute({ number, customerId: req.user.id });
    return {
      order: presentOrder(details.order),
      items: details.items.map((i) => ({
        id: i.id.toString(),
        productSnapshot: i.productSnapshot,
        unitPriceCents: i.unitPrice,
        quantity: i.quantity,
        lineTotalCents: i.lineTotal,
      })),
      payments: details.payments.map((p) => ({
        id: p.id.toString(),
        method: p.method,
        status: p.status,
        amountCents: p.amount,
        installments: p.installments,
        qrCode: p.qrCode,
        qrCodeBase64: p.qrCodeBase64,
        expiresAt: p.expiresAt,
        paidAt: p.paidAt,
      })),
      shipment: details.shipment
        ? {
            carrier: details.shipment.carrier,
            service: details.shipment.service,
            costCents: details.shipment.cost,
            estimatedDays: details.shipment.estimatedDays,
            trackingCode: details.shipment.trackingCode,
            shippedAt: details.shipment.shippedAt,
            deliveredAt: details.shipment.deliveredAt,
          }
        : null,
    };
  }

  @Get(':number/track')
  @ApiOperation({ summary: 'Rastreio de pedido (guest) — valida por email' })
  async trackByNumber(
    @Param('number') number: string,
    @Query('email') email: string,
  ) {
    const details = await this.getByNumberUC.execute({ number, guestEmail: email });
    return {
      number: details.order.number,
      status: details.order.status,
      shipment: details.shipment
        ? {
            carrier: details.shipment.carrier,
            service: details.shipment.service,
            trackingCode: details.shipment.trackingCode,
            shippedAt: details.shipment.shippedAt,
            deliveredAt: details.shipment.deliveredAt,
          }
        : null,
    };
  }
}
