import { Controller, Get } from '@nestjs/common';
import { ListCategoriesUseCase } from '../../../domain/use-cases/categories/list-categories.use-case';

@Controller('categories')
export class CategoriesController {
  constructor(private readonly listCategories: ListCategoriesUseCase) {}

  @Get()
  async list() {
    return this.listCategories.execute();
  }
}
