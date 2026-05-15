import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { jwtSecret } from './jwt.secret';
import { DatabaseModule } from '../database/database.module';
import { CustomerJwtStrategy } from './customer-jwt.strategy';
import { AdminJwtStrategy } from './admin-jwt.strategy';

@Module({
  providers: [CustomerJwtStrategy, AdminJwtStrategy],
  imports: [
    DatabaseModule,
    PassportModule,
    JwtModule.register({
      secret: jwtSecret.secret,
      signOptions: { expiresIn: jwtSecret.expiresIn as any },
    }),
  ],
  exports: [JwtModule],
})
export class AuthenticationModule {}
