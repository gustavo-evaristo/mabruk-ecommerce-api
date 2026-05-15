import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AdminJwtGuard } from 'src/infra/authentication/admin-jwt.guard';
import {
  CreateCollectionUseCase,
  DeleteCollectionUseCase,
  SetCollectionProductsUseCase,
  UpdateCollectionUseCase,
} from 'src/domain/use-cases/admin-catalog';
import { ListCollectionsUseCase } from 'src/domain/use-cases/catalog';
import {
  CreateCollectionDTO,
  SetCollectionProductsDTO,
  UpdateCollectionDTO,
} from 'src/infra/dtos/admin-catalog/collection.dtos';

@ApiTags('B2B / Catalog / Collections')
@ApiBearerAuth()
@UseGuards(AdminJwtGuard)
@Controller('b2b/collections')
export class AdminCollectionsController {
  constructor(
    private readonly listUC: ListCollectionsUseCase,
    private readonly createUC: CreateCollectionUseCase,
    private readonly updateUC: UpdateCollectionUseCase,
    private readonly deleteUC: DeleteCollectionUseCase,
    private readonly setProductsUC: SetCollectionProductsUseCase,
  ) {}

  @Get()
  async list() {
    const items = await this.listUC.execute(false);
    return {
      items: items.map((c) => ({
        id: c.id.toString(),
        slug: c.slug,
        name: c.name,
        description: c.description,
        coverImageUrl: c.coverImageUrl,
        order: c.order,
        isActive: c.isActive,
      })),
    };
  }

  @Post()
  async create(@Body() body: CreateCollectionDTO) {
    const c = await this.createUC.execute(body);
    return { id: c.id.toString(), slug: c.slug };
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() body: UpdateCollectionDTO) {
    const c = await this.updateUC.execute({ id, ...body });
    return { id: c.id.toString(), slug: c.slug };
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    await this.deleteUC.execute(id);
    return { ok: true };
  }

  @Post(':id/products')
  async setProducts(@Param('id') id: string, @Body() body: SetCollectionProductsDTO) {
    await this.setProductsUC.execute({ collectionId: id, productIds: body.productIds });
    return { ok: true };
  }
}
