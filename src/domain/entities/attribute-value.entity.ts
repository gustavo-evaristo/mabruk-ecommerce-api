import { UUID } from './vos';

type AttributeValueEntityProps = {
  id?: UUID | string | null;
  attributeId: UUID | string;
  slug: string;
  name: string;
  hex?: string | null;
  order?: number;
  createdAt?: Date | null;
};

export class AttributeValueEntity {
  id: UUID;
  attributeId: UUID;
  slug: string;
  name: string;
  hex: string | null;
  order: number;
  createdAt: Date;

  constructor(props: AttributeValueEntityProps) {
    if (props.id instanceof UUID) this.id = props.id;
    else if (typeof props.id === 'string') this.id = UUID.from(props.id);
    else this.id = UUID.generate();
    this.attributeId =
      props.attributeId instanceof UUID ? props.attributeId : UUID.from(props.attributeId);
    this.slug = props.slug;
    this.name = props.name;
    this.hex = props.hex ?? null;
    this.order = props.order ?? 0;
    this.createdAt = props.createdAt || new Date();
  }

  update(props: Partial<Omit<AttributeValueEntityProps, 'attributeId'>>) {
    if (props.slug !== undefined) this.slug = props.slug;
    if (props.name !== undefined) this.name = props.name;
    if (props.hex !== undefined) this.hex = props.hex ?? null;
    if (props.order !== undefined) this.order = props.order;
  }
}
