import { Module, OnModuleInit } from '@nestjs/common';
import { DatabaseModule } from '../database/database.module';
import { AuthenticationModule } from '../authentication/authentication.module';
import {
  AdminChangePasswordUseCase,
  AdminLoginUseCase,
  EnsureOwnerSeedUseCase,
} from 'src/domain/use-cases/admin-auth';
import { AdminAuthController } from './b2b/auth/admin-auth.controller';

@Module({
  imports: [DatabaseModule, AuthenticationModule],
  providers: [AdminLoginUseCase, AdminChangePasswordUseCase, EnsureOwnerSeedUseCase],
  controllers: [AdminAuthController],
})
export class AdminAuthModule implements OnModuleInit {
  constructor(private readonly seed: EnsureOwnerSeedUseCase) {}

  async onModuleInit() {
    await this.seed.execute();
  }
}
