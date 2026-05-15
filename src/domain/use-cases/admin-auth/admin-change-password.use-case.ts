import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { IAdminRepository } from 'src/domain/repositories/admin.repository';
import { Password } from 'src/domain/entities/vos';

interface Input {
  adminId: string;
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

@Injectable()
export class AdminChangePasswordUseCase {
  constructor(private readonly adminRepository: IAdminRepository) {}

  async execute(input: Input): Promise<void> {
    const admin = await this.adminRepository.get(input.adminId);
    if (!admin) throw new NotFoundException('Admin not found');

    const ok = Password.create(input.currentPassword).compareWithHash(admin.password.value);
    if (!ok) throw new UnauthorizedException('Senha atual incorreta');

    Password.createWithConfirmation(input.newPassword, input.confirmPassword);
    admin.changePassword(input.newPassword);
    await this.adminRepository.update(admin);
  }
}
