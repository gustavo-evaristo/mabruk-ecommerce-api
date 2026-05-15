import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { IAddressRepository } from 'src/domain/repositories/address.repository';
import { AddressEntity } from 'src/domain/entities/address.entity';
import { UUID } from 'src/domain/entities/vos';

@Injectable()
export class AddressRepository implements IAddressRepository {
  constructor(private readonly prisma: PrismaService) {}

  private toEntity(row: any): AddressEntity {
    return new AddressEntity({
      id: UUID.from(row.id),
      customerId: UUID.from(row.customerId),
      label: row.label,
      recipient: row.recipient,
      zipCode: row.zipCode,
      street: row.street,
      number: row.number,
      complement: row.complement,
      neighborhood: row.neighborhood,
      city: row.city,
      state: row.state,
      isDefault: row.isDefault,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    });
  }

  async listByCustomerId(customerId: string): Promise<AddressEntity[]> {
    const rows = await this.prisma.addresses.findMany({
      where: { customerId },
      orderBy: [{ isDefault: 'desc' }, { createdAt: 'desc' }],
    });
    return rows.map((r) => this.toEntity(r));
  }

  async get(id: string): Promise<AddressEntity | null> {
    const row = await this.prisma.addresses.findUnique({ where: { id } });
    return row ? this.toEntity(row) : null;
  }

  async create(a: AddressEntity): Promise<void> {
    await this.prisma.addresses.create({
      data: {
        id: a.id.toString(),
        customerId: a.customerId.toString(),
        label: a.label,
        recipient: a.recipient,
        zipCode: a.zipCode,
        street: a.street,
        number: a.number,
        complement: a.complement,
        neighborhood: a.neighborhood,
        city: a.city,
        state: a.state,
        isDefault: a.isDefault,
        createdAt: a.createdAt,
        updatedAt: a.updatedAt,
      },
    });
  }

  async update(a: AddressEntity): Promise<void> {
    await this.prisma.addresses.update({
      where: { id: a.id.toString() },
      data: {
        label: a.label,
        recipient: a.recipient,
        zipCode: a.zipCode,
        street: a.street,
        number: a.number,
        complement: a.complement,
        neighborhood: a.neighborhood,
        city: a.city,
        state: a.state,
        isDefault: a.isDefault,
        updatedAt: a.updatedAt,
      },
    });
  }

  async delete(id: string): Promise<void> {
    await this.prisma.addresses.delete({ where: { id } });
  }

  async unsetDefaultForCustomer(customerId: string): Promise<void> {
    await this.prisma.addresses.updateMany({
      where: { customerId, isDefault: true },
      data: { isDefault: false },
    });
  }
}
