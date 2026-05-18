import { Body, Controller, Get, Param, Patch, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AdminJwtGuard } from 'src/infra/authentication/admin-jwt.guard';
import {
  GetAllSettingsUseCase,
  GetSettingsByGroupUseCase,
  UpsertManySettingsUseCase,
} from 'src/domain/use-cases/admin-settings';

@ApiTags('B2B / Settings')
@ApiBearerAuth()
@UseGuards(AdminJwtGuard)
@Controller('b2b/settings')
export class AdminSettingsController {
  constructor(
    private readonly getAllUC: GetAllSettingsUseCase,
    private readonly getGroupUC: GetSettingsByGroupUseCase,
    private readonly upsertManyUC: UpsertManySettingsUseCase,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Lista todas as settings agrupadas' })
  async getAll() {
    return this.getAllUC.execute();
  }

  @Get(':group')
  @ApiOperation({ summary: 'Lista settings de um grupo' })
  async getGroup(@Param('group') group: string) {
    return this.getGroupUC.execute(group);
  }

  @Patch(':group')
  @ApiOperation({ summary: 'Atualiza settings de um grupo (merge)' })
  async patchGroup(@Param('group') group: string, @Body() body: Record<string, unknown>) {
    await this.upsertManyUC.execute(group, body);
    return { ok: true };
  }
}
