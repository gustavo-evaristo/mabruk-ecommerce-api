import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { IShipmentRepository } from 'src/domain/repositories/shipment.repository';
import { ShipmentEntity } from 'src/domain/entities/shipment.entity';
import { UUID } from 'src/domain/entities/vos';

@Injectable()
export class ShipmentRepository implements IShipmentRepository {
  constructor(private readonly prisma: PrismaService) {}

  private toEntity(row: any): ShipmentEntity {
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

  async get(id: string): Promise<ShipmentEntity | null> {
    const row = await this.prisma.shipments.findUnique({ where: { id } });
    return row ? this.toEntity(row) : null;
  }

  async findByOrderId(orderId: string): Promise<ShipmentEntity | null> {
    const row = await this.prisma.shipments.findUnique({ where: { orderId } });
    return row ? this.toEntity(row) : null;
  }

  async upsert(s: ShipmentEntity): Promise<void> {
    await this.prisma.shipments.upsert({
      where: { orderId: s.orderId.toString() },
      update: {
        carrier: s.carrier,
        service: s.service,
        externalOrderId: s.externalOrderId,
        trackingCode: s.trackingCode,
        cost: s.cost,
        estimatedDays: s.estimatedDays,
        shippedAt: s.shippedAt,
        deliveredAt: s.deliveredAt,
        updatedAt: s.updatedAt,
      },
      create: {
        id: s.id.toString(),
        orderId: s.orderId.toString(),
        carrier: s.carrier,
        service: s.service,
        externalOrderId: s.externalOrderId,
        trackingCode: s.trackingCode,
        cost: s.cost,
        estimatedDays: s.estimatedDays,
        shippedAt: s.shippedAt,
        deliveredAt: s.deliveredAt,
        createdAt: s.createdAt,
        updatedAt: s.updatedAt,
      },
    });
  }
}
