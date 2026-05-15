import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { ICustomerRepository } from 'src/domain/repositories/customer.repository';
import { CustomerEntity } from 'src/domain/entities/customer.entity';
import { Password, UUID } from 'src/domain/entities/vos';

@Injectable()
export class CustomerRepository implements ICustomerRepository {
  constructor(private readonly prisma: PrismaService) {}

  private toEntity(row: any): CustomerEntity {
    return new CustomerEntity({
      id: UUID.from(row.id),
      name: row.name,
      email: row.email,
      phone: row.phone,
      cpfCnpj: row.cpfCnpj,
      password: Password.fromHash(row.password),
      emailVerified: row.emailVerified,
      isActive: row.isActive,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    });
  }

  async get(id: string): Promise<CustomerEntity | null> {
    const row = await this.prisma.customers.findUnique({ where: { id, isActive: true } });
    return row ? this.toEntity(row) : null;
  }

  async findByEmail(email: string): Promise<CustomerEntity | null> {
    const row = await this.prisma.customers.findUnique({
      where: { email: email.toLowerCase(), isActive: true },
    });
    return row ? this.toEntity(row) : null;
  }

  async create(c: CustomerEntity): Promise<void> {
    await this.prisma.customers.create({
      data: {
        id: c.id.toString(),
        name: c.name,
        email: c.email.toLowerCase(),
        phone: c.phone,
        cpfCnpj: c.cpfCnpj,
        password: c.password.hash(),
        emailVerified: c.emailVerified,
        isActive: c.isActive,
        createdAt: c.createdAt,
        updatedAt: c.updatedAt,
      },
    });
  }

  async update(c: CustomerEntity): Promise<void> {
    await this.prisma.customers.update({
      where: { id: c.id.toString() },
      data: {
        name: c.name,
        email: c.email.toLowerCase(),
        phone: c.phone,
        cpfCnpj: c.cpfCnpj,
        password: c.password.hash(),
        emailVerified: c.emailVerified,
        isActive: c.isActive,
        updatedAt: c.updatedAt,
      },
    });
  }

  async list({ search, page = 1, pageSize = 20 }: { search?: string; page?: number; pageSize?: number }) {
    const where: any = { isActive: true };
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search } },
        { cpfCnpj: { contains: search } },
      ];
    }
    const [rows, total] = await Promise.all([
      this.prisma.customers.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      this.prisma.customers.count({ where }),
    ]);
    return { items: rows.map((r) => this.toEntity(r)), total };
  }
}
