import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ICustomerRepository } from 'src/domain/repositories/customer.repository';
import { CustomerEntity } from 'src/domain/entities/customer.entity';
import { Password } from 'src/domain/entities/vos';

interface Input {
  email: string;
  password: string;
}

interface Output {
  customer: CustomerEntity;
  token: string;
}

@Injectable()
export class LoginCustomerUseCase {
  constructor(
    private readonly customerRepository: ICustomerRepository,
    private readonly jwtService: JwtService,
  ) {}

  async execute(input: Input): Promise<Output> {
    const customer = await this.customerRepository.findByEmail(input.email);
    if (!customer) throw new UnauthorizedException('Credenciais inválidas');

    const ok = Password.create(input.password).compareWithHash(customer.password.value);
    if (!ok) throw new UnauthorizedException('Credenciais inválidas');

    const token = this.jwtService.sign({ sub: customer.id.toString(), kind: 'customer' });
    return { customer, token };
  }
}
