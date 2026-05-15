import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ICartRepository } from 'src/domain/repositories/cart.repository';

interface Input {
  cartId: string;
  itemId: string;
  quantity: number;
  customerId?: string | null;
  guestToken?: string | null;
}

@Injectable()
export class UpdateCartItemUseCase {
  constructor(private readonly cartRepository: ICartRepository) {}

  async execute(input: Input): Promise<void> {
    if (input.quantity < 1) throw new BadRequestException('Quantity must be at least 1');
    const cart = await this.cartRepository.get(input.cartId);
    if (!cart) throw new NotFoundException('Cart not found');
    if (!cart.canBeAccessedBy({ customerId: input.customerId, guestToken: input.guestToken })) {
      throw new ForbiddenException();
    }
    await this.cartRepository.updateItemQuantity(input.itemId, input.quantity);
  }
}
