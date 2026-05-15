import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CustomerJwtGuard } from 'src/infra/authentication/customer-jwt.guard';
import { AuthenticatedCustomerRequest } from 'src/infra/authentication/types';
import {
  CreateCustomerAddressUseCase,
  DeleteCustomerAddressUseCase,
  ListCustomerAddressesUseCase,
  UpdateCustomerAddressUseCase,
} from 'src/domain/use-cases/customer';
import { CreateAddressDTO, UpdateAddressDTO } from 'src/infra/dtos/customer/customer.dtos';

const present = (a: any) => ({
  id: a.id.toString(),
  label: a.label,
  recipient: a.recipient,
  zipCode: a.zipCode,
  street: a.street,
  number: a.number,
  complement: a.complement,
  neighborhood: a.neighborhood,
  city: a.city,
  state: a.state,
  isDefault: a.isDefault,
});

@ApiTags('B2C / Customers / Addresses')
@ApiBearerAuth()
@UseGuards(CustomerJwtGuard)
@Controller('b2c/customers/me/addresses')
export class AddressesController {
  constructor(
    private readonly listUC: ListCustomerAddressesUseCase,
    private readonly createUC: CreateCustomerAddressUseCase,
    private readonly updateUC: UpdateCustomerAddressUseCase,
    private readonly deleteUC: DeleteCustomerAddressUseCase,
  ) {}

  @Get()
  async list(@Req() req: AuthenticatedCustomerRequest) {
    const items = await this.listUC.execute(req.user.id);
    return { items: items.map(present) };
  }

  @Post()
  async create(
    @Req() req: AuthenticatedCustomerRequest,
    @Body() body: CreateAddressDTO,
  ) {
    const a = await this.createUC.execute({ customerId: req.user.id, ...body });
    return present(a);
  }

  @Patch(':id')
  async update(
    @Req() req: AuthenticatedCustomerRequest,
    @Param('id') id: string,
    @Body() body: UpdateAddressDTO,
  ) {
    const a = await this.updateUC.execute({ id, customerId: req.user.id, ...body });
    return present(a);
  }

  @Delete(':id')
  async remove(@Req() req: AuthenticatedCustomerRequest, @Param('id') id: string) {
    await this.deleteUC.execute({ id, customerId: req.user.id });
    return { ok: true };
  }
}
