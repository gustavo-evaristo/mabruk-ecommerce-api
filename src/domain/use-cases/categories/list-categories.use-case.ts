import { Injectable } from '@nestjs/common';
import { ICategoryRepository } from '../../repositories/category.repository';
import { CategoryEntity } from '../../entities/category.entity';

@Injectable()
export class ListCategoriesUseCase {
  constructor(private readonly categoryRepository: ICategoryRepository) {}

  async execute(): Promise<CategoryEntity[]> {
    return this.categoryRepository.list();
  }
}
