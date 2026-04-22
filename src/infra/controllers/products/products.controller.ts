import { Controller, Get, Param, Query } from '@nestjs/common';
import { ListProductsUseCase } from '../../../domain/use-cases/products/list-products.use-case';
import { GetProductUseCase } from '../../../domain/use-cases/products/get-product.use-case';

@Controller('products')
export class ProductsController {
  constructor(
    private readonly listProducts: ListProductsUseCase,
    private readonly getProduct: GetProductUseCase,
  ) {}

  @Get()
  async list(
    @Query('category') categoryId?: string,
    @Query('subcategory') subcategoryId?: string,
    @Query('plating') platingType?: string,
    @Query('featured') featured?: string,
    @Query('recommended') recommended?: string,
    @Query('search') search?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.listProducts.execute({
      categoryId,
      subcategoryId,
      platingType,
      isFeatured: featured === 'true' ? true : undefined,
      isRecommended: recommended === 'true' ? true : undefined,
      search,
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
    });
  }

  @Get('best-sellers')
  async bestSellers() {
    return this.listProducts.execute({ isFeatured: true, limit: 12 });
  }

  @Get('recommended')
  async recommended() {
    return this.listProducts.execute({ isRecommended: true, limit: 12 });
  }

  @Get(':slug')
  async getOne(@Param('slug') slug: string) {
    return this.getProduct.execute(slug);
  }
}
