import { UUID } from './vos';

export interface ProductSnapshot {
  productId: string;
  name: string;
  slug: string;
  imageUrl?: string | null;
  banho: string;
  size: string;
  sku: string;
}

type OrderItemEntityProps = {
  id?: UUID | string | null;
  orderId: UUID | string;
  variantId: UUID | string;
  productSnapshot: ProductSnapshot;
  unitPrice: number;
  quantity: number;
  lineTotal?: number;
};

export class OrderItemEntity {
  id: UUID;
  orderId: UUID;
  variantId: UUID;
  productSnapshot: ProductSnapshot;
  unitPrice: number;
  quantity: number;
  lineTotal: number;

  constructor(props: OrderItemEntityProps) {
    if (props.id instanceof UUID) {
      this.id = props.id;
    } else if (typeof props.id === 'string') {
      this.id = UUID.from(props.id);
    } else {
      this.id = UUID.generate();
    }
    this.orderId = props.orderId instanceof UUID ? props.orderId : UUID.from(props.orderId);
    this.variantId =
      props.variantId instanceof UUID ? props.variantId : UUID.from(props.variantId);
    this.productSnapshot = props.productSnapshot;
    this.unitPrice = props.unitPrice;
    this.quantity = props.quantity;
    this.lineTotal = props.lineTotal ?? props.unitPrice * props.quantity;
  }
}
