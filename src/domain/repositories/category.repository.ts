import { CategoryEntity } from '../entities/category.entity';

export abstract class ICategoryRepository {
  abstract list(input?: { onlyActive?: boolean }): Promise<CategoryEntity[]>;
  abstract get(id: string): Promise<CategoryEntity | null>;
  abstract findBySlug(slug: string): Promise<CategoryEntity | null>;
  abstract create(category: CategoryEntity): Promise<void>;
  abstract update(category: CategoryEntity): Promise<void>;
  abstract delete(id: string): Promise<void>;
}
