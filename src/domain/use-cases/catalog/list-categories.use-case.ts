import { Injectable } from '@nestjs/common';
import { ICategoryRepository } from 'src/domain/repositories/category.repository';
import { CategoryEntity } from 'src/domain/entities/category.entity';

@Injectable()
export class ListCategoriesUseCase {
  constructor(private readonly categoryRepository: ICategoryRepository) {}

  async execute(onlyActive = true): Promise<CategoryEntity[]> {
    return this.categoryRepository.list({ onlyActive });
  }
}
