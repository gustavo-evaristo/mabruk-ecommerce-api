import { UUID } from './vos';

type InventoryEntityProps = {
  id?: UUID | string | null;
  productId: string;
  quantity?: number;
  reservedQuantity?: number;
  lastSyncedAt?: Date | null;
  createdAt?: Date | null;
  updatedAt?: Date | null;
};

export class InventoryEntity {
  id: UUID;
  productId: string;
  quantity: number;
  reservedQuantity: number;
  lastSyncedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;

  constructor(props: InventoryEntityProps) {
    this.id = props.id instanceof UUID
      ? props.id
      : typeof props.id === 'string'
        ? UUID.from(props.id)
        : UUID.generate();

    this.productId = props.productId;
    this.quantity = props.quantity ?? 0;
    this.reservedQuantity = props.reservedQuantity ?? 0;
    this.lastSyncedAt = props.lastSyncedAt ?? null;
    this.createdAt = props.createdAt || new Date();
    this.updatedAt = props.updatedAt || this.createdAt;
  }

  get available(): number {
    return Math.max(0, this.quantity - this.reservedQuantity);
  }

  updateQuantity(newQuantity: number) {
    this.quantity = newQuantity;
    this.lastSyncedAt = new Date();
    this.updatedAt = new Date();
  }
}
