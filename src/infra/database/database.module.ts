import { Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { IProductRepository } from '../../domain/repositories/product.repository';
import { ICategoryRepository } from '../../domain/repositories/category.repository';
import { ISubcategoryRepository } from '../../domain/repositories/subcategory.repository';
import { IInventoryRepository } from '../../domain/repositories/inventory.repository';
import { ICollectionRepository } from '../../domain/repositories/collection.repository';
import { ISyncLogRepository } from '../../domain/repositories/sync-log.repository';
import { PrismaProductRepository } from './repositories/product.repository';
import { PrismaCategoryRepository } from './repositories/category.repository';
import { PrismaSubcategoryRepository } from './repositories/subcategory.repository';
import { PrismaInventoryRepository } from './repositories/inventory.repository';
import { PrismaCollectionRepository } from './repositories/collection.repository';
import { PrismaSyncLogRepository } from './repositories/sync-log.repository';

@Module({
  providers: [
    PrismaService,
    { provide: IProductRepository, useClass: PrismaProductRepository },
    { provide: ICategoryRepository, useClass: PrismaCategoryRepository },
    { provide: ISubcategoryRepository, useClass: PrismaSubcategoryRepository },
    { provide: IInventoryRepository, useClass: PrismaInventoryRepository },
    { provide: ICollectionRepository, useClass: PrismaCollectionRepository },
    { provide: ISyncLogRepository, useClass: PrismaSyncLogRepository },
  ],
  exports: [
    PrismaService,
    IProductRepository,
    ICategoryRepository,
    ISubcategoryRepository,
    IInventoryRepository,
    ICollectionRepository,
    ISyncLogRepository,
  ],
})
export class DatabaseModule {}
