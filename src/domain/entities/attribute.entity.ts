import { UUID } from './vos';

export type AttributeType = 'SELECT' | 'COLOR';

type AttributeEntityProps = {
  id?: UUID | string | null;
  slug: string;
  name: string;
  type?: AttributeType;
  order?: number;
  createdAt?: Date | null;
  updatedAt?: Date | null;
};

export class AttributeEntity {
  id: UUID;
  slug: string;
  name: string;
  type: AttributeType;
  order: number;
  createdAt: Date;
  updatedAt: Date;

  constructor(props: AttributeEntityProps) {
    if (props.id instanceof UUID) this.id = props.id;
    else if (typeof props.id === 'string') this.id = UUID.from(props.id);
    else this.id = UUID.generate();
    this.slug = props.slug;
    this.name = props.name;
    this.type = props.type ?? 'SELECT';
    this.order = props.order ?? 0;
    const createdAt = props.createdAt || new Date();
    this.createdAt = createdAt;
    this.updatedAt = props.updatedAt || createdAt;
  }

  update(props: Partial<AttributeEntityProps>) {
    if (props.slug !== undefined) this.slug = props.slug;
    if (props.name !== undefined) this.name = props.name;
    if (props.type !== undefined) this.type = props.type;
    if (props.order !== undefined) this.order = props.order;
    this.updatedAt = new Date();
  }
}
