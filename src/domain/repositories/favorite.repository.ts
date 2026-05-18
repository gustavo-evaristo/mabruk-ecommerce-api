import { FavoriteEntity } from '../entities/favorite.entity';
import { ProductListItem } from './product.repository';

export abstract class IFavoriteRepository {
  abstract listByCustomerId(customerId: string): Promise<FavoriteEntity[]>;
  abstract listProductsByCustomerId(customerId: string): Promise<ProductListItem[]>;
  abstract findByCustomerAndProduct(
    customerId: string,
    productId: string,
  ): Promise<FavoriteEntity | null>;
  abstract create(favorite: FavoriteEntity): Promise<void>;
  abstract delete(customerId: string, productId: string): Promise<void>;
}
