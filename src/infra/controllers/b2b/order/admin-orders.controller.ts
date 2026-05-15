import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AdminJwtGuard } from 'src/infra/authentication/admin-jwt.guard';
import {
  AttachInvoiceUseCase,
  AttachTrackingUseCase,
  GetOrderAdminUseCase,
  ListOrdersAdminUseCase,
  UpdateOrderStatusUseCase,
} from 'src/domain/use-cases/admin-order';
import {
  AttachInvoiceDTO,
  AttachTrackingDTO,
  UpdateOrderStatusDTO,
} from 'src/infra/dtos/admin-order/admin-order.dtos';

const presentOrder = (o: any) => ({
  id: o.id.toString(),
  number: o.number,
  status: o.status,
  itemsTotalCents: o.itemsTotal,
  shippingTotalCents: o.shippingTotal,
  grandTotalCents: o.grandTotal,
  invoiceNumber: o.invoiceNumber,
  customer: o.customerSnapshot,
  shippingAddress: o.shippingAddress,
  createdAt: o.createdAt,
  updatedAt: o.updatedAt,
});

@ApiTags('B2B / Orders')
@ApiBearerAuth()
@UseGuards(AdminJwtGuard)
@Controller('b2b/orders')
export class AdminOrdersController {
  constructor(
    private readonly listUC: ListOrdersAdminUseCase,
    private readonly getUC: GetOrderAdminUseCase,
    private readonly updateStatusUC: UpdateOrderStatusUseCase,
    private readonly invoiceUC: AttachInvoiceUseCase,
    private readonly trackingUC: AttachTrackingUseCase,
  ) {}

  @Get()
  async list(
    @Query('status') status?: any,
    @Query('search') search?: string,
    @Query('from') from?: string,
    @Query('to') to?: string,
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
  ) {
    const result = await this.listUC.execute({
      status,
      search,
      from: from ? new Date(from) : undefined,
      to: to ? new Date(to) : undefined,
      page: page ? Number(page) : 1,
      pageSize: pageSize ? Number(pageSize) : 30,
    });
    return {
      items: result.items.map(presentOrder),
      total: result.total,
    };
  }

  @Get(':id')
  async get(@Param('id') id: string) {
    const details = await this.getUC.execute(id);
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
        providerTxId: p.providerTxId,
        paidAt: p.paidAt,
        createdAt: p.createdAt,
      })),
      shipment: details.shipment
        ? {
            carrier: details.shipment.carrier,
            service: details.shipment.service,
            costCents: details.shipment.cost,
            trackingCode: details.shipment.trackingCode,
            shippedAt: details.shipment.shippedAt,
            deliveredAt: details.shipment.deliveredAt,
          }
        : null,
    };
  }

  @Patch(':id/status')
  async updateStatus(@Param('id') id: string, @Body() body: UpdateOrderStatusDTO) {
    const o = await this.updateStatusUC.execute({ id, status: body.status });
    return { id: o.id.toString(), status: o.status };
  }

  @Patch(':id/invoice')
  async attachInvoice(@Param('id') id: string, @Body() body: AttachInvoiceDTO) {
    const o = await this.invoiceUC.execute(id, body.invoiceNumber);
    return { id: o.id.toString(), invoiceNumber: o.invoiceNumber };
  }

  @Patch(':id/shipment')
  async attachShipment(@Param('id') id: string, @Body() body: AttachTrackingDTO) {
    const s = await this.trackingUC.execute({
      orderId: id,
      trackingCode: body.trackingCode,
      carrier: body.carrier,
    });
    return { orderId: s.orderId.toString(), trackingCode: s.trackingCode, carrier: s.carrier };
  }
}
