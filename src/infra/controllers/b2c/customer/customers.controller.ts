import {
  Body,
  Controller,
  Get,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CustomerJwtGuard } from 'src/infra/authentication/customer-jwt.guard';
import { AuthenticatedCustomerRequest } from 'src/infra/authentication/types';
import {
  ChangeCustomerPasswordUseCase,
  GetCustomerProfileUseCase,
  LoginCustomerUseCase,
  SignupCustomerUseCase,
  UpdateCustomerProfileUseCase,
} from 'src/domain/use-cases/customer';
import {
  ChangePasswordDTO,
  LoginCustomerDTO,
  SignupCustomerDTO,
  UpdateProfileDTO,
} from 'src/infra/dtos/customer/customer.dtos';

@ApiTags('B2C / Customers')
@Controller('b2c/customers')
export class CustomersController {
  constructor(
    private readonly signupUC: SignupCustomerUseCase,
    private readonly loginUC: LoginCustomerUseCase,
    private readonly getProfileUC: GetCustomerProfileUseCase,
    private readonly updateProfileUC: UpdateCustomerProfileUseCase,
    private readonly changePasswordUC: ChangeCustomerPasswordUseCase,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Cadastro de cliente' })
  async signup(@Body() body: SignupCustomerDTO) {
    const { customer, token } = await this.signupUC.execute(body);
    return {
      customer: {
        id: customer.id.toString(),
        name: customer.name,
        email: customer.email,
        phone: customer.phone,
      },
      token,
    };
  }

  @Post('login')
  @ApiOperation({ summary: 'Login de cliente' })
  async login(@Body() body: LoginCustomerDTO) {
    const { customer, token } = await this.loginUC.execute(body);
    return {
      customer: {
        id: customer.id.toString(),
        name: customer.name,
        email: customer.email,
      },
      token,
    };
  }

  @Get('me')
  @UseGuards(CustomerJwtGuard)
  @ApiBearerAuth()
  async me(@Req() req: AuthenticatedCustomerRequest) {
    const c = await this.getProfileUC.execute(req.user.id);
    return {
      id: c.id.toString(),
      name: c.name,
      email: c.email,
      phone: c.phone,
      cpfCnpj: c.cpfCnpj,
      emailVerified: c.emailVerified,
      createdAt: c.createdAt,
    };
  }

  @Patch('me')
  @UseGuards(CustomerJwtGuard)
  @ApiBearerAuth()
  async updateMe(
    @Req() req: AuthenticatedCustomerRequest,
    @Body() body: UpdateProfileDTO,
  ) {
    const c = await this.updateProfileUC.execute({ id: req.user.id, ...body });
    return { id: c.id.toString(), name: c.name, phone: c.phone, cpfCnpj: c.cpfCnpj };
  }

  @Post('me/change-password')
  @UseGuards(CustomerJwtGuard)
  @ApiBearerAuth()
  async changePassword(
    @Req() req: AuthenticatedCustomerRequest,
    @Body() body: ChangePasswordDTO,
  ) {
    await this.changePasswordUC.execute({ customerId: req.user.id, ...body });
    return { ok: true };
  }
}
