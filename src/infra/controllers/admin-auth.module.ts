import { Module } from '@nestjs/common';
import { DatabaseModule } from '../database/database.module';
import { AuthenticationModule } from '../authentication/authentication.module';
import {
  AdminChangePasswordUseCase,
  AdminLoginUseCase,
} from 'src/domain/use-cases/admin-auth';
import { AdminAuthController } from './b2b/auth/admin-auth.controller';

@Module({
  imports: [DatabaseModule, AuthenticationModule],
  providers: [AdminLoginUseCase, AdminChangePasswordUseCase],
  controllers: [AdminAuthController],
})
export class AdminAuthModule {}
