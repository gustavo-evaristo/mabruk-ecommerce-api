import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AdminJwtGuard } from 'src/infra/authentication/admin-jwt.guard';
import { CreateTagUseCase, DeleteTagUseCase, UpdateTagUseCase } from 'src/domain/use-cases/admin-catalog';
import { ListTagsUseCase } from 'src/domain/use-cases/catalog';
import { CreateTagDTO, UpdateTagDTO } from 'src/infra/dtos/admin-catalog/tag.dtos';

@ApiTags('B2B / Catalog / Tags')
@ApiBearerAuth()
@UseGuards(AdminJwtGuard)
@Controller('b2b/tags')
export class AdminTagsController {
  constructor(
    private readonly listUC: ListTagsUseCase,
    private readonly createUC: CreateTagUseCase,
    private readonly updateUC: UpdateTagUseCase,
    private readonly deleteUC: DeleteTagUseCase,
  ) {}

  @Get()
  async list() {
    const items = await this.listUC.execute();
    return { items: items.map((t) => ({ id: t.id.toString(), slug: t.slug, name: t.name })) };
  }

  @Post()
  async create(@Body() body: CreateTagDTO) {
    const t = await this.createUC.execute(body);
    return { id: t.id.toString(), slug: t.slug };
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() body: UpdateTagDTO) {
    const t = await this.updateUC.execute({ id, ...body });
    return { id: t.id.toString(), slug: t.slug };
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    await this.deleteUC.execute(id);
    return { ok: true };
  }
}
