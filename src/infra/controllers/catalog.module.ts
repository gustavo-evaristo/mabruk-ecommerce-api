import { Module } from '@nestjs/common';
import { DatabaseModule } from '../database/database.module';
import { AuthenticationModule } from '../authentication/authentication.module';
import { StorageModule } from '../storage/storage.module';

// B2C controllers
import { B2CProductsController, B2CFeaturedController } from './b2c/catalog/products.controller';
import { B2CCategoriesController } from './b2c/catalog/categories.controller';
import { B2CCollectionsController } from './b2c/catalog/collections.controller';
import { B2CTagsController } from './b2c/catalog/tags.controller';
import { B2CBannersController } from './b2c/catalog/banners.controller';

// Admin controllers
import { AdminProductsController } from './b2b/catalog/admin-products.controller';
import { AdminCategoriesController } from './b2b/catalog/admin-categories.controller';
import { AdminCollectionsController } from './b2b/catalog/admin-collections.controller';
import { AdminTagsController } from './b2b/catalog/admin-tags.controller';
import { AdminBannersController } from './b2b/catalog/admin-banners.controller';
import { AdminAttributesController } from './b2b/catalog/admin-attributes.controller';

// Use cases (B2C catalog)
import {
  GetCollectionBySlugUseCase,
  GetProductBySlugUseCase,
  ListBannersB2CUseCase,
  ListCategoriesUseCase,
  ListCollectionsUseCase,
  ListFeaturedProductsUseCase,
  ListProductsB2CUseCase,
  ListRelatedProductsUseCase,
  ListTagsUseCase,
} from 'src/domain/use-cases/catalog';

// Use cases (admin catalog)
import {
  AdjustStockUseCase,
  CreateBannerUseCase,
  CreateCategoryUseCase,
  CreateCollectionUseCase,
  CreateProductUseCase,
  CreateTagUseCase,
  CreateVariantUseCase,
  CleanupExpiredDeletedProductsUseCase,
  CreateAttributeUseCase,
  CreateAttributeValueUseCase,
  DeleteAttributeUseCase,
  DeleteAttributeValueUseCase,
  DeleteBannerUseCase,
  DeleteCategoryUseCase,
  DeleteCollectionUseCase,
  DeleteProductImageUseCase,
  DeleteProductUseCase,
  DeleteTagUseCase,
  DeleteVariantUseCase,
  GenerateProductVariantsUseCase,
  GetProductAdminUseCase,
  HardDeleteProductUseCase,
  ListAttributesUseCase,
  ListBannersAdminUseCase,
  ListDeletedProductsUseCase,
  ListProductsAdminUseCase,
  ReorderProductImagesUseCase,
  RestoreProductUseCase,
  SetCollectionProductsUseCase,
  UpdateAttributeUseCase,
  UpdateAttributeValueUseCase,
  UpdateBannerUseCase,
  UpdateCategoryUseCase,
  UpdateCollectionUseCase,
  UpdateProductUseCase,
  UpdateTagUseCase,
  UpdateVariantUseCase,
  UploadProductImageUseCase,
} from 'src/domain/use-cases/admin-catalog';

@Module({
  imports: [DatabaseModule, AuthenticationModule, StorageModule],
  providers: [
    // B2C
    ListProductsB2CUseCase,
    GetProductBySlugUseCase,
    ListRelatedProductsUseCase,
    ListFeaturedProductsUseCase,
    ListCategoriesUseCase,
    ListCollectionsUseCase,
    GetCollectionBySlugUseCase,
    ListBannersB2CUseCase,
    ListTagsUseCase,
    // Admin — products
    ListProductsAdminUseCase,
    GetProductAdminUseCase,
    CreateProductUseCase,
    UpdateProductUseCase,
    DeleteProductUseCase,
    CreateVariantUseCase,
    UpdateVariantUseCase,
    DeleteVariantUseCase,
    AdjustStockUseCase,
    UploadProductImageUseCase,
    DeleteProductImageUseCase,
    ReorderProductImagesUseCase,
    ListDeletedProductsUseCase,
    RestoreProductUseCase,
    HardDeleteProductUseCase,
    CleanupExpiredDeletedProductsUseCase,
    GenerateProductVariantsUseCase,
    // Admin — attributes
    ListAttributesUseCase,
    CreateAttributeUseCase,
    UpdateAttributeUseCase,
    DeleteAttributeUseCase,
    CreateAttributeValueUseCase,
    UpdateAttributeValueUseCase,
    DeleteAttributeValueUseCase,
    // Admin — category
    CreateCategoryUseCase,
    UpdateCategoryUseCase,
    DeleteCategoryUseCase,
    // Admin — collection
    CreateCollectionUseCase,
    UpdateCollectionUseCase,
    DeleteCollectionUseCase,
    SetCollectionProductsUseCase,
    // Admin — tag
    CreateTagUseCase,
    UpdateTagUseCase,
    DeleteTagUseCase,
    // Admin — banner
    ListBannersAdminUseCase,
    CreateBannerUseCase,
    UpdateBannerUseCase,
    DeleteBannerUseCase,
  ],
  exports: [CleanupExpiredDeletedProductsUseCase],
  controllers: [
    B2CProductsController,
    B2CFeaturedController,
    B2CCategoriesController,
    B2CCollectionsController,
    B2CTagsController,
    B2CBannersController,
    AdminProductsController,
    AdminCategoriesController,
    AdminCollectionsController,
    AdminTagsController,
    AdminBannersController,
    AdminAttributesController,
  ],
})
export class CatalogModule {}
