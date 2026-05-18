import { UUID } from './vos';

export type LandingStatus = 'PUBLISHED' | 'DRAFT' | 'ARCHIVED';

// Cada bloco tem um type e um body livre (validado no use-case se quiser).
export interface LandingBlock {
  id: string;
  type: 'hero' | 'benefits' | 'steps' | 'testimonials' | 'faq' | 'cta';
  props: Record<string, unknown>;
}

type LandingEntityProps = {
  id?: UUID | string | null;
  slug: string;
  name: string;
  blocks?: LandingBlock[];
  seoTitle?: string | null;
  seoDescription?: string | null;
  status?: LandingStatus;
  createdAt?: Date | null;
  updatedAt?: Date | null;
};

export class LandingEntity {
  id: UUID;
  slug: string;
  name: string;
  blocks: LandingBlock[];
  seoTitle: string | null;
  seoDescription: string | null;
  status: LandingStatus;
  createdAt: Date;
  updatedAt: Date;

  constructor(props: LandingEntityProps) {
    this.id = props.id instanceof UUID ? props.id : typeof props.id === 'string' ? UUID.from(props.id) : UUID.generate();
    this.slug = props.slug;
    this.name = props.name;
    this.blocks = props.blocks ?? [];
    this.seoTitle = props.seoTitle ?? null;
    this.seoDescription = props.seoDescription ?? null;
    this.status = props.status ?? 'DRAFT';
    const created = props.createdAt ?? new Date();
    this.createdAt = created;
    this.updatedAt = props.updatedAt ?? created;
  }

  update(props: Partial<LandingEntityProps>) {
    if (props.slug !== undefined) this.slug = props.slug;
    if (props.name !== undefined) this.name = props.name;
    if (props.blocks !== undefined) this.blocks = props.blocks;
    if (props.seoTitle !== undefined) this.seoTitle = props.seoTitle ?? null;
    if (props.seoDescription !== undefined) this.seoDescription = props.seoDescription ?? null;
    if (props.status !== undefined) this.status = props.status;
    this.updatedAt = new Date();
  }
}
