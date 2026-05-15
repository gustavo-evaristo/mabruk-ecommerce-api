import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ListTagsUseCase } from 'src/domain/use-cases/catalog';

@ApiTags('B2C / Catalog / Tags')
@Controller('b2c/tags')
export class B2CTagsController {
  constructor(private readonly useCase: ListTagsUseCase) {}

  @Get()
  @ApiOperation({ summary: 'Lista tags' })
  async list() {
    const items = await this.useCase.execute();
    return { items: items.map((t) => ({ id: t.id.toString(), slug: t.slug, name: t.name })) };
  }
}
