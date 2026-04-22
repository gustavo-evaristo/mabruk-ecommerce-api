import { Module } from '@nestjs/common';
import { DatabaseModule } from './database/database.module';
import { JueriModule } from './jueri/jueri.module';
import { ProductsModule } from './controllers/products/products.module';
import { CategoriesModule } from './controllers/categories/categories.module';
import { CollectionsModule } from './controllers/collections/collections.module';
import { SyncModule } from './controllers/sync/sync.module';
import { AdminModule } from './controllers/admin/admin.module';

@Module({
  imports: [
    DatabaseModule,
    JueriModule,
    ProductsModule,
    CategoriesModule,
    CollectionsModule,
    SyncModule,
    AdminModule,
  ],
})
export class InfraModule {}
