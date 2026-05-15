import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ListCategoriesUseCase } from 'src/domain/use-cases/catalog';

@ApiTags('B2C / Catalog / Categories')
@Controller('b2c/categories')
export class B2CCategoriesController {
  constructor(private readonly useCase: ListCategoriesUseCase) {}

  @Get()
  @ApiOperation({ summary: 'Lista categorias ativas' })
  async list() {
    const items = await this.useCase.execute(true);
    return {
      items: items.map((c) => ({
        id: c.id.toString(),
        slug: c.slug,
        name: c.name,
        order: c.order,
      })),
    };
  }
}
