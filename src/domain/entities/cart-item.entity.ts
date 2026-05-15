import { UUID } from './vos';

type CartItemEntityProps = {
  id?: UUID | string | null;
  cartId: UUID | string;
  variantId: UUID | string;
  quantity: number;
  createdAt?: Date | null;
  updatedAt?: Date | null;
};

export class CartItemEntity {
  id: UUID;
  cartId: UUID;
  variantId: UUID;
  quantity: number;
  createdAt: Date;
  updatedAt: Date;

  constructor(props: CartItemEntityProps) {
    if (props.id instanceof UUID) {
      this.id = props.id;
    } else if (typeof props.id === 'string') {
      this.id = UUID.from(props.id);
    } else {
      this.id = UUID.generate();
    }
    this.cartId = props.cartId instanceof UUID ? props.cartId : UUID.from(props.cartId);
    this.variantId =
      props.variantId instanceof UUID ? props.variantId : UUID.from(props.variantId);

    if (props.quantity < 1) {
      throw new Error('Cart item quantity must be at least 1');
    }
    this.quantity = props.quantity;

    const createdAt = props.createdAt || new Date();
    this.createdAt = createdAt;
    this.updatedAt = props.updatedAt || createdAt;
  }

  changeQuantity(qty: number) {
    if (qty < 1) {
      throw new Error('Cart item quantity must be at least 1');
    }
    this.quantity = qty;
    this.updatedAt = new Date();
  }
}
