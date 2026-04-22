import { UUID } from './vos';

type ProductEntityProps = {
  id?: UUID | string | null;
  jueriId: number;
  sku?: string | null;
  name: string;
  description?: string | null;
  descriptionFull?: string | null;
  categoryId?: string | null;
  subcategoryId?: string | null;
  platingType?: string | null;
  price: number;
  weight?: number | null;
  color?: string | null;
  barcode?: string | null;
  isActive?: boolean;
  isFeatured?: boolean;
  isRecommended?: boolean;
  isFavorite?: boolean;
  displayOrder?: number;
  lastSyncedAt?: Date | null;
  createdAt?: Date | null;
  updatedAt?: Date | null;
};

export class ProductEntity {
  id: UUID;
  jueriId: number;
  sku: string | null;
  name: string;
  description: string | null;
  descriptionFull: string | null;
  categoryId: string | null;
  subcategoryId: string | null;
  platingType: string | null;
  price: number;
  weight: number | null;
  color: string | null;
  barcode: string | null;
  isActive: boolean;
  isFeatured: boolean;
  isRecommended: boolean;
  isFavorite: boolean;
  displayOrder: number;
  lastSyncedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;

  constructor(props: ProductEntityProps) {
    this.id = props.id instanceof UUID
      ? props.id
      : typeof props.id === 'string'
        ? UUID.from(props.id)
        : UUID.generate();

    this.jueriId = props.jueriId;
    this.sku = props.sku ?? null;
    this.name = props.name;
    this.description = props.description ?? null;
    this.descriptionFull = props.descriptionFull ?? null;
    this.categoryId = props.categoryId ?? null;
    this.subcategoryId = props.subcategoryId ?? null;
    this.platingType = props.platingType ?? null;
    this.price = props.price;
    this.weight = props.weight ?? null;
    this.color = props.color ?? null;
    this.barcode = props.barcode ?? null;
    this.isActive = props.isActive ?? true;
    this.isFeatured = props.isFeatured ?? false;
    this.isRecommended = props.isRecommended ?? false;
    this.isFavorite = props.isFavorite ?? false;
    this.displayOrder = props.displayOrder ?? 0;
    this.lastSyncedAt = props.lastSyncedAt ?? null;
    this.createdAt = props.createdAt || new Date();
    this.updatedAt = props.updatedAt || this.createdAt;
  }

  updateFromJueri(props: Pick<ProductEntityProps, 'name' | 'price' | 'platingType' | 'isActive'>) {
    this.name = props.name;
    this.price = props.price;
    this.platingType = props.platingType ?? this.platingType;
    this.isActive = props.isActive ?? this.isActive;
    this.lastSyncedAt = new Date();
    this.updatedAt = new Date();
  }
}
