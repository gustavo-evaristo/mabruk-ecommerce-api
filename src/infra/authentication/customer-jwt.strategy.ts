import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { jwtSecret } from './jwt.secret';
import { ICustomerRepository } from 'src/domain/repositories/customer.repository';

interface Payload {
  sub: string;
  kind: 'customer';
}

@Injectable()
export class CustomerJwtStrategy extends PassportStrategy(Strategy, 'customer-jwt') {
  constructor(private readonly customerRepository: ICustomerRepository) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: jwtSecret.secret,
    });
  }

  async validate(payload: Payload): Promise<{ id: string }> {
    if (!payload?.sub || payload.kind !== 'customer') {
      throw new UnauthorizedException();
    }
    const customer = await this.customerRepository.get(payload.sub);
    if (!customer) {
      throw new UnauthorizedException();
    }
    return { id: customer.id.toString() };
  }
}
