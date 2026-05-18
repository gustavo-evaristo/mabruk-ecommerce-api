import { UUID } from './vos';

type FavoriteEntityProps = {
  id?: UUID | string | null;
  customerId: UUID | string;
  productId: UUID | string;
  createdAt?: Date | null;
};

export class FavoriteEntity {
  id: UUID;
  customerId: UUID;
  productId: UUID;
  createdAt: Date;

  constructor(props: FavoriteEntityProps) {
    if (props.id instanceof UUID) {
      this.id = props.id;
    } else if (typeof props.id === 'string') {
      this.id = UUID.from(props.id);
    } else {
      this.id = UUID.generate();
    }
    this.customerId =
      props.customerId instanceof UUID ? props.customerId : UUID.from(props.customerId);
    this.productId =
      props.productId instanceof UUID ? props.productId : UUID.from(props.productId);
    this.createdAt = props.createdAt || new Date();
  }
}
