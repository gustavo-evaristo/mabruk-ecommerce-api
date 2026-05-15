import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiConsumes, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AdminJwtGuard } from 'src/infra/authentication/admin-jwt.guard';
import { AuthenticatedAdminRequest } from 'src/infra/authentication/types';
import {
  AdjustStockUseCase,
  CreateProductUseCase,
  CreateVariantUseCase,
  DeleteProductImageUseCase,
  DeleteProductUseCase,
  DeleteVariantUseCase,
  GetProductAdminUseCase,
  ListProductsAdminUseCase,
  ReorderProductImagesUseCase,
  UpdateProductUseCase,
  UpdateVariantUseCase,
  UploadProductImageUseCase,
} from 'src/domain/use-cases/admin-catalog';
import {
  AdjustStockDTO,
  CreateProductDTO,
  CreateVariantDTO,
  ReorderImagesDTO,
  UpdateProductDTO,
  UpdateVariantDTO,
} from 'src/infra/dtos/admin-catalog/product.dtos';
import {
  presentProductDetails,
  presentProductListItem,
  presentVariant,
  presentImage,
} from 'src/infra/controllers/presenters/product.presenter';

@ApiTags('B2B / Catalog / Products')
@ApiBearerAuth()
@UseGuards(AdminJwtGuard)
@Controller('b2b/products')
export class AdminProductsController {
  constructor(
    private readonly listProducts: ListProductsAdminUseCase,
    private readonly getProduct: GetProductAdminUseCase,
    private readonly createProduct: CreateProductUseCase,
    private readonly updateProduct: UpdateProductUseCase,
    private readonly deleteProduct: DeleteProductUseCase,
    private readonly createVariant: CreateVariantUseCase,
    private readonly updateVariant: UpdateVariantUseCase,
    private readonly deleteVariant: DeleteVariantUseCase,
    private readonly adjustStock: AdjustStockUseCase,
    private readonly uploadImage: UploadProductImageUseCase,
    private readonly deleteImage: DeleteProductImageUseCase,
    private readonly reorderImages: ReorderProductImagesUseCase,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Lista produtos (admin)' })
  async list(
    @Query('search') search?: string,
    @Query('status') status?: 'DRAFT' | 'ACTIVE' | 'ARCHIVED',
    @Query('categoryId') categoryId?: string,
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
  ) {
    const result = await this.listProducts.execute({
      search,
      status,
      categoryId,
      page: page ? Number(page) : 1,
      pageSize: pageSize ? Number(pageSize) : 30,
    });
    return {
      items: result.items.map(presentProductListItem),
      total: result.total,
      page: result.page,
      pageSize: result.pageSize,
      totalPages: Math.ceil(result.total / result.pageSize),
    };
  }

  @Get(':id')
  async getById(@Param('id') id: string) {
    const details = await this.getProduct.execute(id);
    return presentProductDetails(details);
  }

  @Post()
  async create(@Body() body: CreateProductDTO) {
    const product = await this.createProduct.execute(body);
    return { id: product.id.toString(), slug: product.slug };
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() body: UpdateProductDTO) {
    const product = await this.updateProduct.execute({ id, ...body });
    return { id: product.id.toString(), slug: product.slug };
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    await this.deleteProduct.execute(id);
    return { ok: true };
  }

  @Post(':id/variants')
  async addVariant(@Param('id') productId: string, @Body() body: CreateVariantDTO) {
    const v = await this.createVariant.execute({ productId, ...body });
    return presentVariant(v);
  }

  @Patch(':id/variants/:variantId')
  async editVariant(
    @Param('variantId') variantId: string,
    @Body() body: UpdateVariantDTO,
  ) {
    const v = await this.updateVariant.execute({ variantId, ...body });
    return presentVariant(v);
  }

  @Delete(':id/variants/:variantId')
  async removeVariant(@Param('variantId') variantId: string) {
    await this.deleteVariant.execute(variantId);
    return { ok: true };
  }

  @Post(':id/variants/:variantId/stock')
  async adjust(
    @Param('variantId') variantId: string,
    @Body() body: AdjustStockDTO,
    @Req() req: AuthenticatedAdminRequest,
  ) {
    const v = await this.adjustStock.execute({
      variantId,
      delta: body.delta,
      reason: body.reason,
      notes: body.notes,
      adminId: req.user.id,
    });
    return presentVariant(v);
  }

  @Post(':id/images')
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  async upload(
    @Param('id') productId: string,
    @UploadedFile() file: { buffer: Buffer; mimetype: string; originalname: string },
    @Body('alt') alt?: string,
    @Body('variantId') variantId?: string,
  ) {
    if (!file) throw new Error('File is required (field "file")');
    const img = await this.uploadImage.execute({
      productId,
      variantId: variantId ?? null,
      buffer: file.buffer,
      mimeType: file.mimetype,
      originalName: file.originalname,
      alt,
    });
    return presentImage(img);
  }

  @Delete(':id/images/:imageId')
  async removeImage(@Param('imageId') imageId: string) {
    await this.deleteImage.execute(imageId);
    return { ok: true };
  }

  @Patch(':id/images/reorder')
  async reorder(@Param('id') id: string, @Body() body: ReorderImagesDTO) {
    await this.reorderImages.execute(id, body.imageIds);
    return { ok: true };
  }
}
