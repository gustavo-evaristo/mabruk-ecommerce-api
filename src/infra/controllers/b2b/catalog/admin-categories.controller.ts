import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AdminJwtGuard } from 'src/infra/authentication/admin-jwt.guard';
import {
  CreateCategoryUseCase,
  DeleteCategoryUseCase,
  UpdateCategoryUseCase,
} from 'src/domain/use-cases/admin-catalog';
import { ListCategoriesUseCase } from 'src/domain/use-cases/catalog';
import { CreateCategoryDTO, UpdateCategoryDTO } from 'src/infra/dtos/admin-catalog/category.dtos';

@ApiTags('B2B / Catalog / Categories')
@ApiBearerAuth()
@UseGuards(AdminJwtGuard)
@Controller('b2b/categories')
export class AdminCategoriesController {
  constructor(
    private readonly listUC: ListCategoriesUseCase,
    private readonly createUC: CreateCategoryUseCase,
    private readonly updateUC: UpdateCategoryUseCase,
    private readonly deleteUC: DeleteCategoryUseCase,
  ) {}

  @Get()
  async list() {
    const items = await this.listUC.execute(false);
    return {
      items: items.map((c) => ({
        id: c.id.toString(),
        slug: c.slug,
        name: c.name,
        order: c.order,
        isActive: c.isActive,
      })),
    };
  }

  @Post()
  async create(@Body() body: CreateCategoryDTO) {
    const c = await this.createUC.execute(body);
    return { id: c.id.toString(), slug: c.slug };
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() body: UpdateCategoryDTO) {
    const c = await this.updateUC.execute({ id, ...body });
    return { id: c.id.toString(), slug: c.slug };
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    await this.deleteUC.execute(id);
    return { ok: true };
  }
}
