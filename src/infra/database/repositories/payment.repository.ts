import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { IPaymentRepository } from 'src/domain/repositories/payment.repository';
import { PaymentEntity, PaymentMethod, PaymentStatus } from 'src/domain/entities/payment.entity';
import { UUID } from 'src/domain/entities/vos';

@Injectable()
export class PaymentRepository implements IPaymentRepository {
  constructor(private readonly prisma: PrismaService) {}

  private toEntity(row: any): PaymentEntity {
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

  async create(p: PaymentEntity): Promise<void> {
    await this.prisma.payments.create({
      data: {
        id: p.id.toString(),
        orderId: p.orderId.toString(),
        method: p.method,
        provider: p.provider,
        providerTxId: p.providerTxId,
        status: p.status,
        installments: p.installments,
        amount: p.amount,
        qrCode: p.qrCode,
        qrCodeBase64: p.qrCodeBase64,
        expiresAt: p.expiresAt,
        paidAt: p.paidAt,
        raw: p.raw as any,
        createdAt: p.createdAt,
        updatedAt: p.updatedAt,
      },
    });
  }

  async get(id: string): Promise<PaymentEntity | null> {
    const row = await this.prisma.payments.findUnique({ where: { id } });
    return row ? this.toEntity(row) : null;
  }

  async findByProviderTxId(providerTxId: string): Promise<PaymentEntity | null> {
    const row = await this.prisma.payments.findUnique({ where: { providerTxId } });
    return row ? this.toEntity(row) : null;
  }

  async update(p: PaymentEntity): Promise<void> {
    await this.prisma.payments.update({
      where: { id: p.id.toString() },
      data: {
        status: p.status,
        paidAt: p.paidAt,
        raw: p.raw as any,
        updatedAt: p.updatedAt,
      },
    });
  }

  async listByOrderId(orderId: string): Promise<PaymentEntity[]> {
    const rows = await this.prisma.payments.findMany({
      where: { orderId },
      orderBy: { createdAt: 'desc' },
    });
    return rows.map((r) => this.toEntity(r));
  }
}
