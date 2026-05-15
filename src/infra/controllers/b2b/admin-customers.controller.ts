import { Controller, Get, Param, Query, UseGuards, NotFoundException } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AdminJwtGuard } from 'src/infra/authentication/admin-jwt.guard';
import { ICustomerRepository } from 'src/domain/repositories/customer.repository';
import { ListCustomersAdminUseCase } from 'src/domain/use-cases/admin-order';

@ApiTags('B2B / Customers')
@ApiBearerAuth()
@UseGuards(AdminJwtGuard)
@Controller('b2b/customers')
export class AdminCustomersController {
  constructor(
    private readonly listUC: ListCustomersAdminUseCase,
    private readonly customerRepository: ICustomerRepository,
  ) {}

  @Get()
  async list(
    @Query('search') search?: string,
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
  ) {
    const r = await this.listUC.execute({
      search,
      page: page ? Number(page) : 1,
      pageSize: pageSize ? Number(pageSize) : 30,
    });
    return {
      items: r.items.map((c) => ({
        id: c.id.toString(),
        name: c.name,
        email: c.email,
        phone: c.phone,
        cpfCnpj: c.cpfCnpj,
        createdAt: c.createdAt,
      })),
      total: r.total,
    };
  }

  @Get(':id')
  async get(@Param('id') id: string) {
    const c = await this.customerRepository.get(id);
    if (!c) throw new NotFoundException('Customer not found');
    return {
      id: c.id.toString(),
      name: c.name,
      email: c.email,
      phone: c.phone,
      cpfCnpj: c.cpfCnpj,
      createdAt: c.createdAt,
    };
  }
}
