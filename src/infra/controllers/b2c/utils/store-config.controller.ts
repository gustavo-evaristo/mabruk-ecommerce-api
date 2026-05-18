import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { StoreConfigService } from 'src/domain/services/store-config';
import { ISettingRepository } from 'src/domain/repositories/setting.repository';

/**
 * Endpoint público com as configs da loja que o frontend B2C usa pra renderizar
 * (frete grátis, parcelamento, etc). Cacheável.
 */
@ApiTags('B2C / Utils / Store Config')
@Controller('b2c/store-config')
export class StoreConfigController {
  constructor(
    private readonly storeConfig: StoreConfigService,
    private readonly settings: ISettingRepository,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Configs públicas da loja (frete grátis, parcelamento, etc)' })
  async get() {
    const [freeShippingThresholdCents, maxInstallments, pixSetting] = await Promise.all([
      this.storeConfig.getFreeShippingThresholdCents(),
      this.storeConfig.getMaxInstallments(),
      this.settings.get('payment', 'pixDiscountPercent'),
    ]);

    const rawPix = pixSetting?.value;
    const pixDiscountPercent =
      typeof rawPix === 'number'
        ? rawPix
        : rawPix
          ? Number(rawPix)
          : 0;

    return {
      freeShippingThresholdCents,
      maxInstallments,
      pixDiscountPercent: Number.isFinite(pixDiscountPercent) ? pixDiscountPercent : 0,
    };
  }
}
