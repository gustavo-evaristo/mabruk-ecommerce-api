import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import {
  GetCollectionBySlugUseCase,
  ListCollectionsUseCase,
} from 'src/domain/use-cases/catalog';
import { presentProductListItem } from 'src/infra/controllers/presenters/product.presenter';

@ApiTags('B2C / Catalog / Collections')
@Controller('b2c/collections')
export class B2CCollectionsController {
  constructor(
    private readonly listUseCase: ListCollectionsUseCase,
    private readonly getBySlug: GetCollectionBySlugUseCase,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Lista coleções ativas' })
  async list() {
    const items = await this.listUseCase.execute(true);
    return {
      items: items.map((c) => ({
        id: c.id.toString(),
        slug: c.slug,
        name: c.name,
        description: c.description,
        coverImageUrl: c.coverImageUrl,
        order: c.order,
      })),
    };
  }

  @Get(':slug')
  @ApiOperation({ summary: 'Capa + produtos de uma coleção' })
  async getBySlugRoute(
    @Param('slug') slug: string,
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
  ) {
    const out = await this.getBySlug.execute(slug, page ? Number(page) : 1, pageSize ? Number(pageSize) : 20);
    return {
      collection: {
        id: out.collection.id.toString(),
        slug: out.collection.slug,
        name: out.collection.name,
        description: out.collection.description,
        coverImageUrl: out.collection.coverImageUrl,
      },
      products: {
        items: out.products.items.map(presentProductListItem),
        total: out.products.total,
        page: out.products.page,
        pageSize: out.products.pageSize,
        totalPages: Math.ceil(out.products.total / out.products.pageSize),
      },
    };
  }
}
