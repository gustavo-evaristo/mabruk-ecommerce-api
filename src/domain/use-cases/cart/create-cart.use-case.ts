import { Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { ICartRepository } from 'src/domain/repositories/cart.repository';
import { CartEntity } from 'src/domain/entities/cart.entity';

interface Input {
  customerId?: string | null;
}

interface Output {
  cart: CartEntity;
  guestToken: string | null;
}

@Injectable()
export class CreateCartUseCase {
  constructor(private readonly cartRepository: ICartRepository) {}

  async execute(input: Input): Promise<Output> {
    // Cliente logado tem 1 cart "ativo" no máximo
    if (input.customerId) {
      const existing = await this.cartRepository.findActiveByCustomerId(input.customerId);
      if (existing) return { cart: existing, guestToken: null };
    }

    const guestToken = input.customerId ? null : randomUUID();
    const cart = new CartEntity({
      customerId: input.customerId ?? null,
      guestToken,
    });
    await this.cartRepository.create(cart);
    return { cart, guestToken };
  }
}
