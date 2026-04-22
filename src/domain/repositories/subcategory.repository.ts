import { SubcategoryEntity } from '../entities/subcategory.entity';

export abstract class ISubcategoryRepository {
  abstract list(): Promise<SubcategoryEntity[]>;
  abstract findByJueriId(jueriId: number): Promise<SubcategoryEntity | null>;
  abstract upsert(subcategory: SubcategoryEntity): Promise<SubcategoryEntity>;
}
