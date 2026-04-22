import { Module } from '@nestjs/common';
import { CategoriesController } from './categories.controller';
import { ListCategoriesUseCase } from '../../../domain/use-cases/categories/list-categories.use-case';
import { DatabaseModule } from '../../database/database.module';

@Module({
  imports: [DatabaseModule],
  controllers: [CategoriesController],
  providers: [ListCategoriesUseCase],
})
export class CategoriesModule {}
