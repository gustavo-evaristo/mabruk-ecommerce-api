import { UUID } from './vos';

type CategoryEntityProps = {
  id?: UUID | string | null;
  jueriId: number;
  name: string;
  slug: string;
  createdAt?: Date | null;
  updatedAt?: Date | null;
};

export class CategoryEntity {
  id: UUID;
  jueriId: number;
  name: string;
  slug: string;
  createdAt: Date;
  updatedAt: Date;

  constructor(props: CategoryEntityProps) {
    this.id = props.id instanceof UUID
      ? props.id
      : typeof props.id === 'string'
        ? UUID.from(props.id)
        : UUID.generate();

    this.jueriId = props.jueriId;
    this.name = props.name;
    this.slug = props.slug;
    this.createdAt = props.createdAt || new Date();
    this.updatedAt = props.updatedAt || this.createdAt;
  }
}
