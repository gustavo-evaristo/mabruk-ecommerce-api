import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AdminJwtGuard } from 'src/infra/authentication/admin-jwt.guard';
import {
  CreateBannerUseCase,
  DeleteBannerUseCase,
  ListBannersAdminUseCase,
  UpdateBannerUseCase,
} from 'src/domain/use-cases/admin-catalog';
import { CreateBannerDTO, UpdateBannerDTO } from 'src/infra/dtos/admin-catalog/banner.dtos';

@ApiTags('B2B / Banners')
@ApiBearerAuth()
@UseGuards(AdminJwtGuard)
@Controller('b2b/banners')
export class AdminBannersController {
  constructor(
    private readonly listUC: ListBannersAdminUseCase,
    private readonly createUC: CreateBannerUseCase,
    private readonly updateUC: UpdateBannerUseCase,
    private readonly deleteUC: DeleteBannerUseCase,
  ) {}

  @Get()
  async list() {
    const items = await this.listUC.execute();
    return {
      items: items.map((b) => ({
        id: b.id.toString(),
        imageUrl: b.imageUrl,
        mobileImageUrl: b.mobileImageUrl,
        linkUrl: b.linkUrl,
        alt: b.alt,
        order: b.order,
        isActive: b.isActive,
        startsAt: b.startsAt,
        endsAt: b.endsAt,
      })),
    };
  }

  @Post()
  async create(@Body() body: CreateBannerDTO) {
    const b = await this.createUC.execute(body);
    return { id: b.id.toString() };
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() body: UpdateBannerDTO) {
    const b = await this.updateUC.execute({ id, ...body });
    return { id: b.id.toString() };
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    await this.deleteUC.execute(id);
    return { ok: true };
  }
}
