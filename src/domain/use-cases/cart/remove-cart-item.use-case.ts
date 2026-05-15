import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { ICartRepository } from 'src/domain/repositories/cart.repository';

interface Input {
  cartId: string;
  itemId: string;
  customerId?: string | null;
  guestToken?: string | null;
}

@Injectable()
export class RemoveCartItemUseCase {
  constructor(private readonly cartRepository: ICartRepository) {}

  async execute(input: Input): Promise<void> {
    const cart = await this.cartRepository.get(input.cartId);
    if (!cart) throw new NotFoundException('Cart not found');
    if (!cart.canBeAccessedBy({ customerId: input.customerId, guestToken: input.guestToken })) {
      throw new ForbiddenException();
    }
    await this.cartRepository.removeItem(input.itemId);
  }
}
