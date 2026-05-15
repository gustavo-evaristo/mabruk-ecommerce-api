import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AdminJwtGuard } from 'src/infra/authentication/admin-jwt.guard';
import { GetDashboardUseCase } from 'src/domain/use-cases/admin-order';

@ApiTags('B2B / Dashboard')
@ApiBearerAuth()
@UseGuards(AdminJwtGuard)
@Controller('b2b/dashboard')
export class AdminDashboardController {
  constructor(private readonly useCase: GetDashboardUseCase) {}

  @Get()
  async get(@Query('from') from?: string, @Query('to') to?: string) {
    return this.useCase.execute({
      from: from ? new Date(from) : undefined,
      to: to ? new Date(to) : undefined,
    });
  }
}
