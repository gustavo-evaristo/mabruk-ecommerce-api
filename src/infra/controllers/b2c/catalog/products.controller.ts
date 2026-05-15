import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import {
  GetProductBySlugUseCase,
  ListFeaturedProductsUseCase,
  ListProductsB2CUseCase,
  ListRelatedProductsUseCase,
} from 'src/domain/use-cases/catalog';
import { ListProductsQueryDTO } from 'src/infra/dtos/catalog/list-products.dto';
import {
  presentProductDetails,
  presentProductListItem,
} from 'src/infra/controllers/presenters/product.presenter';

@ApiTags('B2C / Catalog / Products')
@Controller('b2c/products')
export class B2CProductsController {
  constructor(
    private readonly listUseCase: ListProductsB2CUseCase,
    private readonly getBySlug: GetProductBySlugUseCase,
    private readonly relatedUseCase: ListRelatedProductsUseCase,
    private readonly featuredUseCase: ListFeaturedProductsUseCase,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Lista produtos ativos com filtros' })
  async list(@Query() query: ListProductsQueryDTO) {
    const result = await this.listUseCase.execute({
      search: query.search,
      categorySlug: query.category,
      collectionSlug: query.collection,
      tagSlug: query.tag,
      banho: query.banho,
      minPriceCents: query.minPriceCents,
      maxPriceCents: query.maxPriceCents,
      inStock: query.inStock,
      sort: query.sort,
      page: query.page,
      pageSize: query.pageSize,
    });
    return {
      items: result.items.map(presentProductListItem),
      total: result.total,
      page: result.page,
      pageSize: result.pageSize,
      totalPages: Math.ceil(result.total / result.pageSize),
    };
  }

  @Get(':slug')
  @ApiOperation({ summary: 'Detalhes do produto (PDP) por slug' })
  async getBySlugRoute(@Param('slug') slug: string) {
    const details = await this.getBySlug.execute(slug);
    return presentProductDetails(details);
  }

  @Get(':slug/related')
  @ApiOperation({ summary: 'Produtos relacionados (mesma categoria)' })
  async related(@Param('slug') slug: string) {
    const items = await this.relatedUseCase.execute(slug, 8);
    return { items: items.map(presentProductListItem) };
  }
}

@ApiTags('B2C / Catalog / Featured')
@Controller('b2c/featured')
export class B2CFeaturedController {
  constructor(private readonly featuredUseCase: ListFeaturedProductsUseCase) {}

  @Get()
  @ApiOperation({ summary: 'Produtos em destaque (mais vendidos)' })
  async list() {
    const items = await this.featuredUseCase.execute(8);
    return { items: items.map(presentProductListItem) };
  }
}
