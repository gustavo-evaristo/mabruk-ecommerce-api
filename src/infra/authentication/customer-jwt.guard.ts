import { AuthGuard } from '@nestjs/passport';

export class CustomerJwtGuard extends AuthGuard('customer-jwt') {}
