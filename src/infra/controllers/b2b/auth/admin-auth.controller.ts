import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AdminJwtGuard } from 'src/infra/authentication/admin-jwt.guard';
import { AuthenticatedAdminRequest } from 'src/infra/authentication/types';
import {
  AdminChangePasswordUseCase,
  AdminLoginUseCase,
} from 'src/domain/use-cases/admin-auth';
import { IAdminRepository } from 'src/domain/repositories/admin.repository';
import {
  AdminChangePasswordDTO,
  AdminLoginDTO,
} from 'src/infra/dtos/admin-auth/admin-auth.dtos';

@ApiTags('B2B / Auth')
@Controller('b2b/auth')
export class AdminAuthController {
  constructor(
    private readonly loginUC: AdminLoginUseCase,
    private readonly changePasswordUC: AdminChangePasswordUseCase,
    private readonly adminRepository: IAdminRepository,
  ) {}

  @Post('login')
  @ApiOperation({ summary: 'Login do admin' })
  async login(@Body() body: AdminLoginDTO) {
    const { admin, token } = await this.loginUC.execute(body);
    return {
      admin: {
        id: admin.id.toString(),
        name: admin.name,
        email: admin.email,
        role: admin.role,
      },
      token,
    };
  }

  @Get('me')
  @UseGuards(AdminJwtGuard)
  @ApiBearerAuth()
  async me(@Req() req: AuthenticatedAdminRequest) {
    const a = await this.adminRepository.get(req.user.id);
    if (!a) return null;
    return { id: a.id.toString(), name: a.name, email: a.email, role: a.role };
  }

  @Post('change-password')
  @UseGuards(AdminJwtGuard)
  @ApiBearerAuth()
  async changePassword(
    @Req() req: AuthenticatedAdminRequest,
    @Body() body: AdminChangePasswordDTO,
  ) {
    await this.changePasswordUC.execute({ adminId: req.user.id, ...body });
    return { ok: true };
  }
}
