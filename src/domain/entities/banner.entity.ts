import { UUID } from './vos';

type BannerEntityProps = {
  id?: UUID | string | null;
  imageUrl: string;
  mobileImageUrl?: string | null;
  linkUrl?: string | null;
  alt?: string | null;
  order?: number;
  isActive?: boolean;
  startsAt?: Date | null;
  endsAt?: Date | null;
  createdAt?: Date | null;
  updatedAt?: Date | null;
};

export class BannerEntity {
  id: UUID;
  imageUrl: string;
  mobileImageUrl: string | null;
  linkUrl: string | null;
  alt: string | null;
  order: number;
  isActive: boolean;
  startsAt: Date | null;
  endsAt: Date | null;
  createdAt: Date;
  updatedAt: Date;

  constructor(props: BannerEntityProps) {
    if (props.id instanceof UUID) {
      this.id = props.id;
    } else if (typeof props.id === 'string') {
      this.id = UUID.from(props.id);
    } else {
      this.id = UUID.generate();
    }
    this.imageUrl = props.imageUrl;
    this.mobileImageUrl = props.mobileImageUrl ?? null;
    this.linkUrl = props.linkUrl ?? null;
    this.alt = props.alt ?? null;
    this.order = props.order ?? 0;
    this.isActive = props.isActive ?? true;
    this.startsAt = props.startsAt ?? null;
    this.endsAt = props.endsAt ?? null;

    const createdAt = props.createdAt || new Date();
    this.createdAt = createdAt;
    this.updatedAt = props.updatedAt || createdAt;
  }

  private touch() {
    this.updatedAt = new Date();
  }

  update(props: Partial<BannerEntityProps>) {
    if (props.imageUrl !== undefined) this.imageUrl = props.imageUrl;
    if (props.mobileImageUrl !== undefined) this.mobileImageUrl = props.mobileImageUrl ?? null;
    if (props.linkUrl !== undefined) this.linkUrl = props.linkUrl ?? null;
    if (props.alt !== undefined) this.alt = props.alt ?? null;
    if (props.order !== undefined) this.order = props.order;
    if (props.isActive !== undefined) this.isActive = props.isActive;
    if (props.startsAt !== undefined) this.startsAt = props.startsAt ?? null;
    if (props.endsAt !== undefined) this.endsAt = props.endsAt ?? null;
    this.touch();
  }

  isVisibleAt(date: Date): boolean {
    if (!this.isActive) return false;
    if (this.startsAt && date < this.startsAt) return false;
    if (this.endsAt && date > this.endsAt) return false;
    return true;
  }
}
