import { CategoryEntity } from '../entities/category.entity';

export abstract class ICategoryRepository {
  abstract list(): Promise<CategoryEntity[]>;
  abstract findById(id: string): Promise<CategoryEntity | null>;
  abstract findByJueriId(jueriId: number): Promise<CategoryEntity | null>;
  abstract upsert(category: CategoryEntity): Promise<CategoryEntity>;
}
