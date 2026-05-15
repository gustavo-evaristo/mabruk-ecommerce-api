import { Body, Controller, Headers, Param, Post, Req } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Request } from 'express';
import {
  CreateCardPaymentUseCase,
  CreatePixPaymentUseCase,
  HandlePaymentWebhookUseCase,
} from 'src/domain/use-cases/payment';
import { CreateCardPaymentDTO } from 'src/infra/dtos/payment/payment.dtos';

@ApiTags('B2C / Payments')
@Controller('b2c/payments')
export class PaymentsController {
  constructor(
    private readonly pixUC: CreatePixPaymentUseCase,
    private readonly cardUC: CreateCardPaymentUseCase,
    private readonly webhookUC: HandlePaymentWebhookUseCase,
  ) {}

  @Post(':orderId/pix')
  @ApiOperation({ summary: 'Cria intenção PIX para um pedido' })
  async pix(@Param('orderId') orderId: string) {
    return this.pixUC.execute(orderId);
  }

  @Post(':orderId/card')
  @ApiOperation({ summary: 'Tokeniza/processa cartão para um pedido' })
  async card(@Param('orderId') orderId: string, @Body() body: CreateCardPaymentDTO) {
    return this.cardUC.execute({ orderId, ...body });
  }
}

@ApiTags('B2C / Webhooks')
@Controller('b2c/webhooks')
export class WebhookController {
  constructor(private readonly webhookUC: HandlePaymentWebhookUseCase) {}

  @Post('payment')
  @ApiOperation({ summary: 'Webhook do gateway de pagamento' })
  async handle(@Headers() headers: Record<string, string>, @Req() req: Request) {
    return this.webhookUC.execute({ headers, body: req.body });
  }
}
