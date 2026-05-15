import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { IAdminRepository } from 'src/domain/repositories/admin.repository';
import { AdminEntity } from 'src/domain/entities/admin.entity';
import { Password } from 'src/domain/entities/vos';

interface Input {
  email: string;
  password: string;
}

interface Output {
  admin: AdminEntity;
  token: string;
}

@Injectable()
export class AdminLoginUseCase {
  constructor(
    private readonly adminRepository: IAdminRepository,
    private readonly jwtService: JwtService,
  ) {}

  async execute(input: Input): Promise<Output> {
    const admin = await this.adminRepository.findByEmail(input.email);
    if (!admin) throw new UnauthorizedException('Credenciais inválidas');

    const ok = Password.create(input.password).compareWithHash(admin.password.value);
    if (!ok) throw new UnauthorizedException('Credenciais inválidas');

    const token = this.jwtService.sign({
      sub: admin.id.toString(),
      kind: 'admin',
      role: admin.role,
    });
    return { admin, token };
  }
}
