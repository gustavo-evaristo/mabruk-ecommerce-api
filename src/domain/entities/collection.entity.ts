import { UUID } from './vos';

type CollectionEntityProps = {
  id?: UUID | string | null;
  name: string;
  slug: string;
  description?: string | null;
  coverImage?: string | null;
  isActive?: boolean;
  displayOrder?: number;
  createdAt?: Date | null;
  updatedAt?: Date | null;
};

export class CollectionEntity {
  id: UUID;
  name: string;
  slug: string;
  description: string | null;
  coverImage: string | null;
  isActive: boolean;
  displayOrder: number;
  createdAt: Date;
  updatedAt: Date;

  constructor(props: CollectionEntityProps) {
    this.id = props.id instanceof UUID
      ? props.id
      : typeof props.id === 'string'
        ? UUID.from(props.id)
        : UUID.generate();

    this.name = props.name;
    this.slug = props.slug;
    this.description = props.description ?? null;
    this.coverImage = props.coverImage ?? null;
    this.isActive = props.isActive ?? true;
    this.displayOrder = props.displayOrder ?? 0;
    this.createdAt = props.createdAt || new Date();
    this.updatedAt = props.updatedAt || this.createdAt;
  }
}
