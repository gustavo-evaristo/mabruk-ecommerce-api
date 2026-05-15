import { UUID } from './vos';

type TagEntityProps = {
  id?: UUID | string | null;
  slug: string;
  name: string;
  createdAt?: Date | null;
};

export class TagEntity {
  id: UUID;
  slug: string;
  name: string;
  createdAt: Date;

  constructor(props: TagEntityProps) {
    if (props.id instanceof UUID) {
      this.id = props.id;
    } else if (typeof props.id === 'string') {
      this.id = UUID.from(props.id);
    } else {
      this.id = UUID.generate();
    }
    this.slug = props.slug;
    this.name = props.name;
    this.createdAt = props.createdAt || new Date();
  }
}
