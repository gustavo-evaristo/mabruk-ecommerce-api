import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../../../generated/prisma/client';

@Injectable()
export class PrismaService implements OnModuleInit, OnModuleDestroy {
  readonly db: PrismaClient;

  constructor() {
    const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
    this.db = new PrismaClient({ adapter } as any);
  }

  async onModuleInit() {
    await (this.db as any).$connect();
  }

  async onModuleDestroy() {
    await (this.db as any).$disconnect();
  }
}
