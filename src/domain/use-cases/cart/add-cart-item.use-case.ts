import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ICartRepository } from 'src/domain/repositories/cart.repository';
import { IProductVariantRepository } from 'src/domain/repositories/product-variant.repository';
import { CartItemEntity } from 'src/domain/entities/cart-item.entity';

interface Input {
  cartId: string;
  variantId: string;
  quantity: number;
  customerId?: string | null;
  guestToken?: string | null;
}

@Injectable()
export class AddCartItemUseCase {
  constructor(
    private readonly cartRepository: ICartRepository,
    private readonly variantRepository: IProductVariantRepository,
  ) {}

  async execute(input: Input): Promise<void> {
    if (input.quantity < 1) throw new BadRequestException('Quantity must be at least 1');

    const cart = await this.cartRepository.get(input.cartId);
    if (!cart) throw new NotFoundException('Cart not found');
    if (!cart.canBeAccessedBy({ customerId: input.customerId, guestToken: input.guestToken })) {
      throw new ForbiddenException();
    }

    const variant = await this.variantRepository.get(input.variantId);
    if (!variant || !variant.isActive) throw new NotFoundException('Variant not found');

    if (variant.stock < input.quantity) {
      throw new BadRequestException(`Estoque insuficiente. Disponível: ${variant.stock}`);
    }

    const item = new CartItemEntity({
      cartId: input.cartId,
      variantId: input.variantId,
      quantity: input.quantity,
    });
    await this.cartRepository.upsertItem(item);
  }
}
