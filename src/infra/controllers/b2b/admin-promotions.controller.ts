import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import {
  IsDateString,
  IsIn,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { AdminJwtGuard } from 'src/infra/authentication/admin-jwt.guard';
import {
  CreatePromotionUseCase,
  DeletePromotionUseCase,
  GetPromotionUseCase,
  ListPromotionsUseCase,
  UpdatePromotionUseCase,
} from 'src/domain/use-cases/admin-promotions';
import type { PromotionEntity, PromotionType } from 'src/domain/entities/promotion.entity';

class CreatePromotionDTO {
  @IsIn(['CAMPAIGN', 'COUPON', 'RULE']) type!: PromotionType;
  @IsString() @IsNotEmpty() name!: string;
  @IsOptional() @IsString() code?: string;
  @IsOptional() @IsString() description?: string;
  @IsIn(['PERCENT', 'FIXED_CENTS', 'FREE_SHIPPING']) discountType!:
    | 'PERCENT' | 'FIXED_CENTS' | 'FREE_SHIPPING';
  @IsInt() @Min(0) discountValue!: number;
  @IsOptional() @IsString() scope?: string;
  @IsOptional() @IsInt() @Min(0) usesMax?: number;
  @IsOptional() @IsDateString() startsAt?: string;
  @IsOptional() @IsDateString() expiresAt?: string;
  @IsOptional() @IsIn(['ACTIVE', 'SCHEDULED', 'EXPIRED', 'PAUSED']) status?:
    | 'ACTIVE' | 'SCHEDULED' | 'EXPIRED' | 'PAUSED';
}

class UpdatePromotionDTO {
  @IsOptional() @IsIn(['CAMPAIGN', 'COUPON', 'RULE']) type?: PromotionType;
  @IsOptional() @IsString() name?: string;
  @IsOptional() @IsString() code?: string;
  @IsOptional() @IsString() description?: string;
  @IsOptional() @IsIn(['PERCENT', 'FIXED_CENTS', 'FREE_SHIPPING']) discountType?:
    | 'PERCENT' | 'FIXED_CENTS' | 'FREE_SHIPPING';
  @IsOptional() @IsInt() @Min(0) discountValue?: number;
  @IsOptional() @IsString() scope?: string;
  @IsOptional() @IsInt() @Min(0) usesMax?: number;
  @IsOptional() @IsDateString() startsAt?: string;
  @IsOptional() @IsDateString() expiresAt?: string;
  @IsOptional() @IsIn(['ACTIVE', 'SCHEDULED', 'EXPIRED', 'PAUSED']) status?:
    | 'ACTIVE' | 'SCHEDULED' | 'EXPIRED' | 'PAUSED';
}

const present = (p: PromotionEntity) => ({
  id: p.id.toString(),
  type: p.type,
  name: p.name,
  code: p.code,
  description: p.description,
  discountType: p.discountType,
  discountValue: p.discountValue,
  scope: p.scope,
  usesMax: p.usesMax,
  usesCount: p.usesCount,
  startsAt: p.startsAt,
  expiresAt: p.expiresAt,
  status: p.status,
  createdAt: p.createdAt,
});

@ApiTags('B2B / Promotions')
@ApiBearerAuth()
@UseGuards(AdminJwtGuard)
@Controller('b2b/promotions')
export class AdminPromotionsController {
  constructor(
    private readonly listUC: ListPromotionsUseCase,
    private readonly getUC: GetPromotionUseCase,
    private readonly createUC: CreatePromotionUseCase,
    private readonly updateUC: UpdatePromotionUseCase,
    private readonly deleteUC: DeletePromotionUseCase,
  ) {}

  @Get()
  async list(@Query('type') type?: PromotionType) {
    const items = await this.listUC.execute(type);
    return { items: items.map(present) };
  }

  @Get(':id')
  async get(@Param('id') id: string) {
    return present(await this.getUC.execute(id));
  }

  @Post()
  async create(@Body() body: CreatePromotionDTO) {
    const p = await this.createUC.execute({
      ...body,
      startsAt: body.startsAt ? new Date(body.startsAt) : undefined,
      expiresAt: body.expiresAt ? new Date(body.expiresAt) : undefined,
    });
    return present(p);
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() body: UpdatePromotionDTO) {
    const p = await this.updateUC.execute({
      id,
      ...body,
      startsAt: body.startsAt ? new Date(body.startsAt) : undefined,
      expiresAt: body.expiresAt ? new Date(body.expiresAt) : undefined,
    });
    return present(p);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    await this.deleteUC.execute(id);
    return { ok: true };
  }
}
