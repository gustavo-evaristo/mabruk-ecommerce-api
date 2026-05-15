import { ConflictException, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ICustomerRepository } from 'src/domain/repositories/customer.repository';
import { CustomerEntity } from 'src/domain/entities/customer.entity';
import { Email, Password } from 'src/domain/entities/vos';

interface Input {
  name: string;
  email: string;
  phone?: string;
  cpfCnpj?: string;
  password: string;
  confirmPassword: string;
}

interface Output {
  customer: CustomerEntity;
  token: string;
}

@Injectable()
export class SignupCustomerUseCase {
  constructor(
    private readonly customerRepository: ICustomerRepository,
    private readonly jwtService: JwtService,
  ) {}

  async execute(input: Input): Promise<Output> {
    const email = Email.create(input.email).value;
    const password = Password.createWithConfirmation(input.password, input.confirmPassword);

    const exists = await this.customerRepository.findByEmail(email);
    if (exists) {
      throw new ConflictException('E-mail já cadastrado');
    }

    const customer = new CustomerEntity({
      name: input.name,
      email,
      phone: input.phone,
      cpfCnpj: input.cpfCnpj,
      password,
    });

    await this.customerRepository.create(customer);

    const token = this.jwtService.sign({
      sub: customer.id.toString(),
      kind: 'customer',
    });

    return { customer, token };
  }
}
