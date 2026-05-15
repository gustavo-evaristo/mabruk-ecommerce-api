import { TagEntity } from '../entities/tag.entity';

export abstract class ITagRepository {
  abstract list(): Promise<TagEntity[]>;
  abstract get(id: string): Promise<TagEntity | null>;
  abstract findBySlug(slug: string): Promise<TagEntity | null>;
  abstract create(tag: TagEntity): Promise<void>;
  abstract update(tag: TagEntity): Promise<void>;
  abstract delete(id: string): Promise<void>;
  abstract syncProductTags(productId: string, tagIds: string[]): Promise<void>;
  abstract listProductTags(productId: string): Promise<TagEntity[]>;
}
