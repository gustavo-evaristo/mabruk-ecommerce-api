import { UUID } from './vos';

type ProductVariantEntityProps = {
  id?: UUID | string | null;
  productId: UUID | string;
  sku: string;
  price: number; // cents
  stock?: number;
  isActive?: boolean;
  weightInGrams?: number | null;
  isDefault?: boolean;
  createdAt?: Date | null;
  updatedAt?: Date | null;
};

export class ProductVariantEntity {
  id: UUID;
  productId: UUID;
  sku: string;
  price: number;
  stock: number;
  isActive: boolean;
  weightInGrams: number | null;
  isDefault: boolean;
  createdAt: Date;
  updatedAt: Date;

  constructor(props: ProductVariantEntityProps) {
    if (props.id instanceof UUID) this.id = props.id;
    else if (typeof props.id === 'string') this.id = UUID.from(props.id);
    else this.id = UUID.generate();
    this.productId =
      props.productId instanceof UUID ? props.productId : UUID.from(props.productId);
    this.sku = props.sku;
    this.price = props.price;
    this.stock = props.stock ?? 0;
    this.isActive = props.isActive ?? true;
    this.weightInGrams = props.weightInGrams ?? null;
    this.isDefault = props.isDefault ?? false;

    const createdAt = props.createdAt || new Date();
    this.createdAt = createdAt;
    this.updatedAt = props.updatedAt || createdAt;
  }

  private touch() {
    this.updatedAt = new Date();
  }

  update(props: Partial<ProductVariantEntityProps>) {
    if (props.sku !== undefined) this.sku = props.sku;
    if (props.price !== undefined) this.price = props.price;
    if (props.stock !== undefined) this.stock = props.stock;
    if (props.isActive !== undefined) this.isActive = props.isActive;
    if (props.weightInGrams !== undefined) this.weightInGrams = props.weightInGrams ?? null;
    this.touch();
  }

  applyStockDelta(delta: number) {
    const next = this.stock + delta;
    if (next < 0) {
      throw new Error(`Insufficient stock for variant ${this.sku}`);
    }
    this.stock = next;
    this.touch();
  }
}
