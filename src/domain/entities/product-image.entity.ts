import { UUID } from './vos';

type ProductImageEntityProps = {
  id?: UUID | string | null;
  productId: UUID | string;
  variantId?: UUID | string | null;
  url: string;
  alt?: string | null;
  order?: number;
  createdAt?: Date | null;
};

export class ProductImageEntity {
  id: UUID;
  productId: UUID;
  variantId: UUID | null;
  url: string;
  alt: string | null;
  order: number;
  createdAt: Date;

  constructor(props: ProductImageEntityProps) {
    if (props.id instanceof UUID) {
      this.id = props.id;
    } else if (typeof props.id === 'string') {
      this.id = UUID.from(props.id);
    } else {
      this.id = UUID.generate();
    }
    this.productId =
      props.productId instanceof UUID ? props.productId : UUID.from(props.productId);

    if (props.variantId === null || props.variantId === undefined) {
      this.variantId = null;
    } else if (props.variantId instanceof UUID) {
      this.variantId = props.variantId;
    } else {
      this.variantId = UUID.from(props.variantId);
    }

    this.url = props.url;
    this.alt = props.alt ?? null;
    this.order = props.order ?? 0;
    this.createdAt = props.createdAt || new Date();
  }
}
