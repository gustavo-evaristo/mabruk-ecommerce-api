import { Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import {
  IAddressRepository,
  IAdminRepository,
  IBannerRepository,
  ICartRepository,
  ICategoryRepository,
  ICollectionRepository,
  ICustomerRepository,
  IOrderRepository,
  IPaymentRepository,
  IProductImageRepository,
  IProductRepository,
  IProductVariantRepository,
  IShipmentRepository,
  IStockMovementRepository,
  ITagRepository,
} from 'src/domain/repositories';
import { CategoryRepository } from './repositories/category.repository';
import { CollectionRepository } from './repositories/collection.repository';
import { TagRepository } from './repositories/tag.repository';
import { BannerRepository } from './repositories/banner.repository';
import { ProductRepository } from './repositories/product.repository';
import { ProductVariantRepository } from './repositories/product-variant.repository';
import { ProductImageRepository } from './repositories/product-image.repository';
import { CustomerRepository } from './repositories/customer.repository';
import { AddressRepository } from './repositories/address.repository';
import { AdminRepository } from './repositories/admin.repository';
import { CartRepository } from './repositories/cart.repository';
import { OrderRepository } from './repositories/order.repository';
import { PaymentRepository } from './repositories/payment.repository';
import { ShipmentRepository } from './repositories/shipment.repository';
import { StockMovementRepository } from './repositories/stock-movement.repository';

@Module({
  providers: [
    PrismaService,
    { provide: ICategoryRepository, useClass: CategoryRepository },
    { provide: ICollectionRepository, useClass: CollectionRepository },
    { provide: ITagRepository, useClass: TagRepository },
    { provide: IBannerRepository, useClass: BannerRepository },
    { provide: IProductRepository, useClass: ProductRepository },
    { provide: IProductVariantRepository, useClass: ProductVariantRepository },
    { provide: IProductImageRepository, useClass: ProductImageRepository },
    { provide: ICustomerRepository, useClass: CustomerRepository },
    { provide: IAddressRepository, useClass: AddressRepository },
    { provide: IAdminRepository, useClass: AdminRepository },
    { provide: ICartRepository, useClass: CartRepository },
    { provide: IOrderRepository, useClass: OrderRepository },
    { provide: IPaymentRepository, useClass: PaymentRepository },
    { provide: IShipmentRepository, useClass: ShipmentRepository },
    { provide: IStockMovementRepository, useClass: StockMovementRepository },
  ],
  exports: [
    PrismaService,
    ICategoryRepository,
    ICollectionRepository,
    ITagRepository,
    IBannerRepository,
    IProductRepository,
    IProductVariantRepository,
    IProductImageRepository,
    ICustomerRepository,
    IAddressRepository,
    IAdminRepository,
    ICartRepository,
    IOrderRepository,
    IPaymentRepository,
    IShipmentRepository,
    IStockMovementRepository,
  ],
})
export class DatabaseModule {}
