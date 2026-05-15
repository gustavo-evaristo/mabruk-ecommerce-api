import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CartWithItems, ICartRepository } from 'src/domain/repositories/cart.repository';
import { CartEntity } from 'src/domain/entities/cart.entity';
import { CartItemEntity } from 'src/domain/entities/cart-item.entity';
import { UUID } from 'src/domain/entities/vos';

@Injectable()
export class CartRepository implements ICartRepository {
  constructor(private readonly prisma: PrismaService) {}

  private toCartEntity(row: any): CartEntity {
    return new CartEntity({
      id: UUID.from(row.id),
      customerId: row.customerId ? UUID.from(row.customerId) : null,
      guestToken: row.guestToken,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    });
  }

  private toItemEntity(row: any): CartItemEntity {
    return new CartItemEntity({
      id: UUID.from(row.id),
      cartId: UUID.from(row.cartId),
      variantId: UUID.from(row.variantId),
      quantity: row.quantity,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    });
  }

  async create(c: CartEntity): Promise<void> {
    await this.prisma.carts.create({
      data: {
        id: c.id.toString(),
        customerId: c.customerId?.toString() ?? null,
        guestToken: c.guestToken,
        createdAt: c.createdAt,
        updatedAt: c.updatedAt,
      },
    });
  }

  async get(id: string): Promise<CartEntity | null> {
    const row = await this.prisma.carts.findUnique({ where: { id } });
    return row ? this.toCartEntity(row) : null;
  }

  async getWithItems(id: string): Promise<CartWithItems | null> {
    const row = await this.prisma.carts.findUnique({
      where: { id },
      include: { items: true },
    });
    if (!row) return null;
    return {
      cart: this.toCartEntity(row),
      items: row.items.map((i) => this.toItemEntity(i)),
    };
  }

  async findActiveByCustomerId(customerId: string): Promise<CartEntity | null> {
    const row = await this.prisma.carts.findFirst({
      where: { customerId },
      orderBy: { createdAt: 'desc' },
    });
    return row ? this.toCartEntity(row) : null;
  }

  async findByGuestToken(guestToken: string): Promise<CartEntity | null> {
    const row = await this.prisma.carts.findUnique({ where: { guestToken } });
    return row ? this.toCartEntity(row) : null;
  }

  async attachCustomer(cartId: string, customerId: string): Promise<void> {
    await this.prisma.carts.update({
      where: { id: cartId },
      data: { customerId, guestToken: null, updatedAt: new Date() },
    });
  }

  async upsertItem(item: CartItemEntity): Promise<void> {
    await this.prisma.cart_items.upsert({
      where: { cartId_variantId: { cartId: item.cartId.toString(), variantId: item.variantId.toString() } },
      update: { quantity: item.quantity, updatedAt: new Date() },
      create: {
        id: item.id.toString(),
        cartId: item.cartId.toString(),
        variantId: item.variantId.toString(),
        quantity: item.quantity,
        createdAt: item.createdAt,
        updatedAt: item.updatedAt,
      },
    });
    await this.prisma.carts.update({
      where: { id: item.cartId.toString() },
      data: { updatedAt: new Date() },
    });
  }

  async updateItemQuantity(itemId: string, quantity: number): Promise<void> {
    await this.prisma.cart_items.update({
      where: { id: itemId },
      data: { quantity, updatedAt: new Date() },
    });
  }

  async removeItem(itemId: string): Promise<void> {
    await this.prisma.cart_items.delete({ where: { id: itemId } });
  }

  async clearItems(cartId: string): Promise<void> {
    await this.prisma.cart_items.deleteMany({ where: { cartId } });
  }

  async delete(id: string): Promise<void> {
    await this.prisma.carts.delete({ where: { id } });
  }
}
