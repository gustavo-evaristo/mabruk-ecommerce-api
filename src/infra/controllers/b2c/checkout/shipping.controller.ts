import { Body, Controller, Headers, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtService } from '@nestjs/jwt';
import { QuoteShippingUseCase } from 'src/domain/use-cases/checkout';
import { QuoteShippingDTO } from 'src/infra/dtos/checkout/checkout.dtos';

@ApiTags('B2C / Shipping')
@Controller('b2c/shipping')
export class ShippingController {
  constructor(
    private readonly quoteUC: QuoteShippingUseCase,
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

  @Post('quote')
  @ApiOperation({ summary: 'Cota frete para um carrinho' })
  async quote(
    @Body() body: QuoteShippingDTO,
    @Headers('authorization') auth?: string,
    @Headers('x-cart-token') guestToken?: string,
  ) {
    const customerId = this.resolveCustomerId(auth);
    return this.quoteUC.execute({
      cartId: body.cartId,
      zipCode: body.zipCode,
      customerId,
      guestToken,
    });
  }
}
