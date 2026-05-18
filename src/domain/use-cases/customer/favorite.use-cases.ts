import { Injectable, NotFoundException } from '@nestjs/common';
import { IFavoriteRepository } from 'src/domain/repositories/favorite.repository';
import { IProductRepository, ProductListItem } from 'src/domain/repositories/product.repository';
import { FavoriteEntity } from 'src/domain/entities/favorite.entity';

@Injectable()
export class ListCustomerFavoritesUseCase {
  constructor(private readonly favorites: IFavoriteRepository) {}

  async execute(customerId: string): Promise<ProductListItem[]> {
    return this.favorites.listProductsByCustomerId(customerId);
  }
}

interface AddFavoriteInput {
  customerId: string;
  productId: string;
}

@Injectable()
export class AddFavoriteUseCase {
  constructor(
    private readonly favorites: IFavoriteRepository,
    private readonly products: IProductRepository,
  ) {}

  async execute(input: AddFavoriteInput): Promise<FavoriteEntity> {
    const product = await this.products.get(input.productId);
    if (!product) throw new NotFoundException('Product not found');

    const existing = await this.favorites.findByCustomerAndProduct(
      input.customerId,
      input.productId,
    );
    if (existing) return existing;

    const favorite = new FavoriteEntity({
      customerId: input.customerId,
      productId: input.productId,
    });
    await this.favorites.create(favorite);
    return favorite;
  }
}

interface RemoveFavoriteInput {
  customerId: string;
  productId: string;
}

@Injectable()
export class RemoveFavoriteUseCase {
  constructor(private readonly favorites: IFavoriteRepository) {}

  async execute(input: RemoveFavoriteInput): Promise<void> {
    await this.favorites.delete(input.customerId, input.productId);
  }
}
