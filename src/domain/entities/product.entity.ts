import { UUID } from './vos';

export type ProductStatus = 'DRAFT' | 'ACTIVE' | 'ARCHIVED';
export type ProductType = 'SIMPLE' | 'VARIABLE';

type ProductEntityProps = {
  id?: UUID | string | null;
  slug: string;
  name: string;
  description?: string | null;
  status?: ProductStatus;
  type?: ProductType;
  categoryId: UUID | string;
  basePrice: number;            // cents
  sku?: string | null;          // só para SIMPLE
  price?: number | null;        // cents — só para SIMPLE
  stock?: number;               // só para SIMPLE
  weightInGrams?: number | null;
  dimensionLength?: number | null;
  dimensionWidth?: number | null;
  dimensionHeight?: number | null;
  seoTitle?: string | null;
  seoDescription?: string | null;
  createdAt?: Date | null;
  updatedAt?: Date | null;
};

export class ProductEntity {
  id: UUID;
  slug: string;
  name: string;
  description: string | null;
  status: ProductStatus;
  type: ProductType;
  categoryId: UUID;
  basePrice: number;
  sku: string | null;
  price: number | null;
  stock: number;
  weightInGrams: number | null;
  dimensionLength: number | null;
  dimensionWidth: number | null;
  dimensionHeight: number | null;
  seoTitle: string | null;
  seoDescription: string | null;
  createdAt: Date;
  updatedAt: Date;

  constructor(props: ProductEntityProps) {
    if (props.id instanceof UUID) this.id = props.id;
    else if (typeof props.id === 'string') this.id = UUID.from(props.id);
    else this.id = UUID.generate();
    this.slug = props.slug;
    this.name = props.name;
    this.description = props.description ?? null;
    this.status = props.status ?? 'DRAFT';
    this.type = props.type ?? 'SIMPLE';
    this.categoryId =
      props.categoryId instanceof UUID ? props.categoryId : UUID.from(props.categoryId);
    this.basePrice = props.basePrice;
    this.sku = props.sku ?? null;
    this.price = props.price ?? null;
    this.stock = props.stock ?? 0;
    this.weightInGrams = props.weightInGrams ?? null;
    this.dimensionLength = props.dimensionLength ?? null;
    this.dimensionWidth = props.dimensionWidth ?? null;
    this.dimensionHeight = props.dimensionHeight ?? null;
    this.seoTitle = props.seoTitle ?? null;
    this.seoDescription = props.seoDescription ?? null;
    const createdAt = props.createdAt || new Date();
    this.createdAt = createdAt;
    this.updatedAt = props.updatedAt || createdAt;
  }

  private touch() {
    this.updatedAt = new Date();
  }

  update(props: Partial<ProductEntityProps>) {
    if (props.slug !== undefined) this.slug = props.slug;
    if (props.name !== undefined) this.name = props.name;
    if (props.description !== undefined) this.description = props.description ?? null;
    if (props.status !== undefined) this.status = props.status;
    if (props.type !== undefined) this.type = props.type;
    if (props.categoryId !== undefined) {
      this.categoryId =
        props.categoryId instanceof UUID ? props.categoryId : UUID.from(props.categoryId);
    }
    if (props.basePrice !== undefined) this.basePrice = props.basePrice;
    if (props.sku !== undefined) this.sku = props.sku ?? null;
    if (props.price !== undefined) this.price = props.price ?? null;
    if (props.stock !== undefined) this.stock = props.stock;
    if (props.weightInGrams !== undefined) this.weightInGrams = props.weightInGrams ?? null;
    if (props.dimensionLength !== undefined) this.dimensionLength = props.dimensionLength ?? null;
    if (props.dimensionWidth !== undefined) this.dimensionWidth = props.dimensionWidth ?? null;
    if (props.dimensionHeight !== undefined) this.dimensionHeight = props.dimensionHeight ?? null;
    if (props.seoTitle !== undefined) this.seoTitle = props.seoTitle ?? null;
    if (props.seoDescription !== undefined) this.seoDescription = props.seoDescription ?? null;
    this.touch();
  }

  archive() {
    this.status = 'ARCHIVED';
    this.touch();
  }

  publish() {
    this.status = 'ACTIVE';
    this.touch();
  }
}
