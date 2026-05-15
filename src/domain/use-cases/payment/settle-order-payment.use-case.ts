import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/infra/database/prisma.service';
import { IPaymentRepository } from 'src/domain/repositories/payment.repository';
import { IOrderRepository } from 'src/domain/repositories/order.repository';
import { MailSender } from 'src/domain/services/mail-sender';

interface Input {
  providerTxId: string;
}

/**
 * Liquida um pagamento aprovado: atualiza Order/Payment, decrementa estoque
 * e grava StockMovement — tudo dentro de uma transação Prisma.
 *
 * Idempotente: se já foi liquidado antes, no-op.
 */
@Injectable()
export class SettleOrderPaymentUseCase {
  private readonly logger = new Logger(SettleOrderPaymentUseCase.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly paymentRepository: IPaymentRepository,
    private readonly orderRepository: IOrderRepository,
    private readonly mailSender: MailSender,
  ) {}

  async execute(input: Input): Promise<void> {
    const payment = await this.paymentRepository.findByProviderTxId(input.providerTxId);
    if (!payment) throw new NotFoundException('Payment not found');

    if (payment.status === 'APPROVED') {
      this.logger.log(`Payment ${input.providerTxId} já estava aprovado — idempotente.`);
      return;
    }

    const orderDetails = await this.orderRepository.getDetailsById(payment.orderId.toString());
    if (!orderDetails) throw new NotFoundException('Order not found');

    if (orderDetails.order.status !== 'PENDING_PAYMENT') {
      this.logger.warn(
        `Order ${orderDetails.order.number} não está PENDING_PAYMENT (atual=${orderDetails.order.status}). Pulando settle.`,
      );
      // Atualiza só o pagamento para consistência
      payment.approve();
      await this.paymentRepository.update(payment);
      return;
    }

    const orderIdStr = orderDetails.order.id.toString();
    const paidAt = new Date();

    // Transação atômica: payment APPROVED + order PAID + decrementar estoque + movimentos
    await this.prisma.$transaction(async (tx) => {
      await tx.payments.update({
        where: { id: payment.id.toString() },
        data: { status: 'APPROVED', paidAt, updatedAt: new Date() },
      });
      await tx.orders.update({
        where: { id: orderIdStr },
        data: { status: 'PAID', updatedAt: new Date() },
      });

      for (const item of orderDetails.items) {
        const variantId = item.variantId.toString();
        await tx.product_variants.update({
          where: { id: variantId },
          data: { stock: { decrement: item.quantity }, updatedAt: new Date() },
        });
        await tx.stock_movements.create({
          data: {
            variantId,
            delta: -item.quantity,
            reason: 'ORDER_PAID',
            referenceId: orderIdStr,
            notes: `Order ${orderDetails.order.number}`,
          },
        });
      }
    });

    // E-mail de confirmação fora da transação (best-effort)
    try {
      await this.mailSender.send({
        to: orderDetails.order.customerSnapshot.email,
        template: 'payment_approved',
        data: {
          customerName: orderDetails.order.customerSnapshot.name,
          orderNumber: orderDetails.order.number,
          grandTotalCents: orderDetails.order.grandTotal,
        },
      });
    } catch {
      /* ok */
    }
  }
}
