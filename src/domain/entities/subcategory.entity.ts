import { UUID } from './vos';

type SubcategoryEntityProps = {
  id?: UUID | string | null;
  jueriId: number;
  categoryId: string;
  name: string;
  slug: string;
  createdAt?: Date | null;
  updatedAt?: Date | null;
};

export class SubcategoryEntity {
  id: UUID;
  jueriId: number;
  categoryId: string;
  name: string;
  slug: string;
  createdAt: Date;
  updatedAt: Date;

  constructor(props: SubcategoryEntityProps) {
    this.id = props.id instanceof UUID
      ? props.id
      : typeof props.id === 'string'
        ? UUID.from(props.id)
        : UUID.generate();

    this.jueriId = props.jueriId;
    this.categoryId = props.categoryId;
    this.name = props.name;
    this.slug = props.slug;
    this.createdAt = props.createdAt || new Date();
    this.updatedAt = props.updatedAt || this.createdAt;
  }
}
