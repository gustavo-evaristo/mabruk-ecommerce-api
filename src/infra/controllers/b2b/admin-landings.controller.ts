import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { IsArray, IsIn, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { AdminJwtGuard } from 'src/infra/authentication/admin-jwt.guard';
import {
  CreateLandingUseCase,
  DeleteLandingUseCase,
  GetLandingUseCase,
  ListLandingsUseCase,
  UpdateLandingUseCase,
} from 'src/domain/use-cases/admin-landings';
import type { LandingEntity, LandingStatus } from 'src/domain/entities/landing.entity';

class CreateLandingDTO {
  @IsString() @IsNotEmpty() name!: string;
  @IsOptional() @IsString() slug?: string;
  @IsOptional() @IsArray() blocks?: unknown[];
  @IsOptional() @IsString() seoTitle?: string;
  @IsOptional() @IsString() seoDescription?: string;
  @IsOptional() @IsIn(['PUBLISHED', 'DRAFT', 'ARCHIVED']) status?: LandingStatus;
}

class UpdateLandingDTO {
  @IsOptional() @IsString() name?: string;
  @IsOptional() @IsString() slug?: string;
  @IsOptional() @IsArray() blocks?: unknown[];
  @IsOptional() @IsString() seoTitle?: string;
  @IsOptional() @IsString() seoDescription?: string;
  @IsOptional() @IsIn(['PUBLISHED', 'DRAFT', 'ARCHIVED']) status?: LandingStatus;
}

const present = (l: LandingEntity) => ({
  id: l.id.toString(),
  slug: l.slug,
  name: l.name,
  blocks: l.blocks,
  seoTitle: l.seoTitle,
  seoDescription: l.seoDescription,
  status: l.status,
  createdAt: l.createdAt,
  updatedAt: l.updatedAt,
});

@ApiTags('B2B / Landings')
@ApiBearerAuth()
@UseGuards(AdminJwtGuard)
@Controller('b2b/landings')
export class AdminLandingsController {
  constructor(
    private readonly listUC: ListLandingsUseCase,
    private readonly getUC: GetLandingUseCase,
    private readonly createUC: CreateLandingUseCase,
    private readonly updateUC: UpdateLandingUseCase,
    private readonly deleteUC: DeleteLandingUseCase,
  ) {}

  @Get()
  async list() {
    const items = await this.listUC.execute();
    return { items: items.map(present) };
  }

  @Get(':id')
  async get(@Param('id') id: string) {
    return present(await this.getUC.execute(id));
  }

  @Post()
  async create(@Body() body: CreateLandingDTO) {
    const l = await this.createUC.execute(body as never);
    return present(l);
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() body: UpdateLandingDTO) {
    const payload = { ...body } as unknown as Record<string, unknown>;
    const l = await this.updateUC.execute({ id, ...payload } as never);
    return present(l);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    await this.deleteUC.execute(id);
    return { ok: true };
  }
}
