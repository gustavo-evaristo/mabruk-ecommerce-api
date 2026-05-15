import { Body, Controller, Headers, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtService } from '@nestjs/jwt';
import { CreateOrderFromCartUseCase } from 'src/domain/use-cases/checkout';
import { CreateOrderDTO } from 'src/infra/dtos/checkout/checkout.dtos';

@ApiTags('B2C / Checkout')
@Controller('b2c/checkout')
export class CheckoutController {
  constructor(
    private readonly createOrderUC: CreateOrderFromCartUseCase,
    private readonly jwtService: JwtService,
  ) {}

  private resolveCustomerId(authHeader?: string): string | null {
    if (!authHeader?.startsWith('Bearer ')) return null;
    try {
      const payload = this.jwtService.verify(authHeader.slice(7));
      return payload?.kind === 'customer' ? payload.sub : null;
    } catch {
      return null;
    }
  }

  @Post()
  @ApiOperation({ summary: 'Cria pedido a partir do carrinho' })
  async create(
    @Body() body: CreateOrderDTO,
    @Headers('authorization') auth?: string,
    @Headers('x-cart-token') guestToken?: string,
  ) {
    const customerId = this.resolveCustomerId(auth);
    return this.createOrderUC.execute({
      cartId: body.cartId,
      shippingAddress: body.shippingAddress,
      shippingChoice: body.shippingChoice,
      customer: body.customer,
      customerId,
      guestToken,
      notes: body.notes,
    });
  }
}
