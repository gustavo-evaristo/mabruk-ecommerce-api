import { Injectable } from '@nestjs/common';
import { IOrderRepository } from 'src/domain/repositories/order.repository';
import { PrismaService } from 'src/infra/database/prisma.service';

export interface DashboardOutput {
  range: { from: Date; to: Date };
  salesTotalCents: number;
  ordersCount: number;
  averageTicketCents: number;
  pendingOrdersCount: number;
  lowStockCount: number;
  topProducts: { variantId: string; productId: string; productName: string; quantity: number }[];
}

@Injectable()
export class GetDashboardUseCase {
  constructor(
    private readonly orderRepository: IOrderRepository,
    private readonly prisma: PrismaService,
  ) {}

  async execute(input: { from?: Date; to?: Date }): Promise<DashboardOutput> {
    const to = input.to ?? new Date();
    const from = input.from ?? new Date(to.getTime() - 30 * 24 * 60 * 60 * 1000);

    const [summary, top, lowStock] = await Promise.all([
      this.orderRepository.dashboardSummary({ from, to }),
      this.orderRepository.topSellingVariants({ from, to, limit: 5 }),
      this.prisma.product_variants.count({ where: { isActive: true, stock: { lte: 3 } } }),
    ]);

    return {
      range: { from, to },
      salesTotalCents: summary.salesTotalCents,
      ordersCount: summary.ordersCount,
      averageTicketCents: summary.averageTicketCents,
      pendingOrdersCount: summary.pendingOrdersCount,
      lowStockCount: lowStock,
      topProducts: top,
    };
  }
}
