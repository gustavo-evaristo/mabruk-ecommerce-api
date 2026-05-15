import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { jwtSecret } from './jwt.secret';
import { IAdminRepository } from 'src/domain/repositories/admin.repository';

interface Payload {
  sub: string;
  kind: 'admin';
  role: string;
}

@Injectable()
export class AdminJwtStrategy extends PassportStrategy(Strategy, 'admin-jwt') {
  constructor(private readonly adminRepository: IAdminRepository) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: jwtSecret.secret,
    });
  }

  async validate(payload: Payload): Promise<{ id: string; role: string }> {
    if (!payload?.sub || payload.kind !== 'admin') {
      throw new UnauthorizedException();
    }
    const admin = await this.adminRepository.get(payload.sub);
    if (!admin) {
      throw new UnauthorizedException();
    }
    return { id: admin.id.toString(), role: admin.role };
  }
}
