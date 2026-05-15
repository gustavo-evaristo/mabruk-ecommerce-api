import { UUID } from './vos';

type CollectionEntityProps = {
  id?: UUID | string | null;
  slug: string;
  name: string;
  description?: string | null;
  coverImageUrl?: string | null;
  order?: number;
  isActive?: boolean;
  createdAt?: Date | null;
  updatedAt?: Date | null;
};

export class CollectionEntity {
  id: UUID;
  slug: string;
  name: string;
  description: string | null;
  coverImageUrl: string | null;
  order: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;

  constructor(props: CollectionEntityProps) {
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
    this.coverImageUrl = props.coverImageUrl ?? null;
    this.order = props.order ?? 0;
    this.isActive = props.isActive ?? true;

    const createdAt = props.createdAt || new Date();
    this.createdAt = createdAt;
    this.updatedAt = props.updatedAt || createdAt;
  }

  private touch() {
    this.updatedAt = new Date();
  }

  update(props: Partial<CollectionEntityProps>) {
    if (props.slug !== undefined) this.slug = props.slug;
    if (props.name !== undefined) this.name = props.name;
    if (props.description !== undefined) this.description = props.description ?? null;
    if (props.coverImageUrl !== undefined) this.coverImageUrl = props.coverImageUrl ?? null;
    if (props.order !== undefined) this.order = props.order;
    if (props.isActive !== undefined) this.isActive = props.isActive;
    this.touch();
  }
}
