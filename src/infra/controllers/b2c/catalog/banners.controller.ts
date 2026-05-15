import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ListBannersB2CUseCase } from 'src/domain/use-cases/catalog';

@ApiTags('B2C / Banners')
@Controller('b2c/banners')
export class B2CBannersController {
  constructor(private readonly useCase: ListBannersB2CUseCase) {}

  @Get()
  @ApiOperation({ summary: 'Banners ativos da home' })
  async list() {
    const items = await this.useCase.execute();
    return {
      items: items.map((b) => ({
        id: b.id.toString(),
        imageUrl: b.imageUrl,
        mobileImageUrl: b.mobileImageUrl,
        linkUrl: b.linkUrl,
        alt: b.alt,
        order: b.order,
      })),
    };
  }
}
