import { CartEntity } from '../entities/cart.entity';
import { CartItemEntity } from '../entities/cart-item.entity';

export interface CartWithItems {
  cart: CartEntity;
  items: CartItemEntity[];
}

export abstract class ICartRepository {
  abstract create(cart: CartEntity): Promise<void>;
  abstract get(id: string): Promise<CartEntity | null>;
  abstract getWithItems(id: string): Promise<CartWithItems | null>;
  abstract findActiveByCustomerId(customerId: string): Promise<CartEntity | null>;
  abstract findByGuestToken(guestToken: string): Promise<CartEntity | null>;
  abstract attachCustomer(cartId: string, customerId: string): Promise<void>;
  abstract upsertItem(item: CartItemEntity): Promise<void>;
  abstract updateItemQuantity(itemId: string, quantity: number): Promise<void>;
  abstract removeItem(itemId: string): Promise<void>;
  abstract clearItems(cartId: string): Promise<void>;
  abstract delete(id: string): Promise<void>;
}
