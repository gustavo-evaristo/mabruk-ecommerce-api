import { UUID } from './vos';

export type ProductStatus = 'DRAFT' | 'ACTIVE' | 'ARCHIVED';

type ProductEntityProps = {
  id?: UUID | string | null;
  slug: string;
  name: string;
  description?: string | null;
  status?: ProductStatus;
  categoryId: UUID | string;
  basePrice: number; // cents
  garantia?: string | null;
  cuidados?: string | null;
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
  categoryId: UUID;
  basePrice: number;
  garantia: string | null;
  cuidados: string | null;
  weightInGrams: number | null;
  dimensionLength: number | null;
  dimensionWidth: number | null;
  dimensionHeight: number | null;
  seoTitle: string | null;
  seoDescription: string | null;
  createdAt: Date;
  updatedAt: Date;

  constructor(props: ProductEntityProps) {
    if (props.id instanceof UUID) {
      this.id = props.id;
    } else if (typeof props.id === 'string') {
      this.id = UUID.from(props.id);
    } else {
      this.id = UUID.generate();
    }
    this.slug = props.slug;
    this.name = props.name;
    this.description = props.description ?? null;
    this.status = props.status ?? 'DRAFT';

    if (props.categoryId instanceof UUID) {
      this.categoryId = props.categoryId;
    } else {
      this.categoryId = UUID.from(props.categoryId);
    }

    this.basePrice = props.basePrice;
    this.garantia = props.garantia ?? null;
    this.cuidados = props.cuidados ?? null;
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
    if (props.categoryId !== undefined) {
      this.categoryId =
        props.categoryId instanceof UUID ? props.categoryId : UUID.from(props.categoryId);
    }
    if (props.basePrice !== undefined) this.basePrice = props.basePrice;
    if (props.garantia !== undefined) this.garantia = props.garantia ?? null;
    if (props.cuidados !== undefined) this.cuidados = props.cuidados ?? null;
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
