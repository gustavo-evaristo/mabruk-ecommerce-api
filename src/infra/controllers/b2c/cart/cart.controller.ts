import {
  Body,
  Controller,
  Delete,
  Get,
  Headers,
  Param,
  Patch,
  Post,
  Req,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtService } from '@nestjs/jwt';
import {
  AddCartItemUseCase,
  CreateCartUseCase,
  GetCartUseCase,
  RemoveCartItemUseCase,
  UpdateCartItemUseCase,
} from 'src/domain/use-cases/cart';
import {
  AddCartItemDTO,
  CreateCartDTO,
  UpdateCartItemDTO,
} from 'src/infra/dtos/cart/cart.dtos';

/**
 * Cart é semi-autenticado: aceita token JWT do cliente *ou* X-Cart-Token (guest).
 * Não usa o JwtGuard padrão pra permitir ambos.
 */
@ApiTags('B2C / Cart')
@Controller('b2c/carts')
export class CartController {
  constructor(
    private readonly createUC: CreateCartUseCase,
    private readonly getUC: GetCartUseCase,
    private readonly addItemUC: AddCartItemUseCase,
    private readonly updateItemUC: UpdateCartItemUseCase,
    private readonly removeItemUC: RemoveCartItemUseCase,
    private readonly jwtService: JwtService,
  ) {}

  private resolveCustomerId(authHeader?: string): string | null {
    if (!authHeader || !authHeader.startsWith('Bearer ')) return null;
    try {
      const payload = this.jwtService.verify(authHeader.slice(7));
      return payload?.kind === 'customer' ? payload.sub : null;
    } catch {
      return null;
    }
  }

  @Post()
  @ApiOperation({ summary: 'Cria carrinho (guest se sem auth)' })
  async create(
    @Body() body: CreateCartDTO,
    @Headers('authorization') auth?: string,
  ) {
    const customerId = body.customerId ?? this.resolveCustomerId(auth);
    const { cart, guestToken } = await this.createUC.execute({ customerId });
    return {
      cartId: cart.id.toString(),
      guestToken,
    };
  }

  @Get(':id')
  async get(
    @Param('id') id: string,
    @Headers('authorization') auth?: string,
    @Headers('x-cart-token') guestToken?: string,
  ) {
    const customerId = this.resolveCustomerId(auth);
    const view = await this.getUC.execute({ cartId: id, customerId, guestToken });
    return {
      cartId: view.cart.id.toString(),
      lines: view.lines,
      subtotalCents: view.subtotalCents,
      totalItems: view.totalItems,
    };
  }

  @Post(':id/items')
  async addItem(
    @Param('id') id: string,
    @Body() body: AddCartItemDTO,
    @Headers('authorization') auth?: string,
    @Headers('x-cart-token') guestToken?: string,
  ) {
    const customerId = this.resolveCustomerId(auth);
    await this.addItemUC.execute({
      cartId: id,
      variantId: body.variantId,
      quantity: body.quantity,
      customerId,
      guestToken,
    });
    return { ok: true };
  }

  @Patch(':id/items/:itemId')
  async updateItem(
    @Param('id') id: string,
    @Param('itemId') itemId: string,
    @Body() body: UpdateCartItemDTO,
    @Headers('authorization') auth?: string,
    @Headers('x-cart-token') guestToken?: string,
  ) {
    const customerId = this.resolveCustomerId(auth);
    await this.updateItemUC.execute({
      cartId: id,
      itemId,
      quantity: body.quantity,
      customerId,
      guestToken,
    });
    return { ok: true };
  }

  @Delete(':id/items/:itemId')
  async removeItem(
    @Param('id') id: string,
    @Param('itemId') itemId: string,
    @Headers('authorization') auth?: string,
    @Headers('x-cart-token') guestToken?: string,
  ) {
    const customerId = this.resolveCustomerId(auth);
    await this.removeItemUC.execute({
      cartId: id,
      itemId,
      customerId,
      guestToken,
    });
    return { ok: true };
  }
}
