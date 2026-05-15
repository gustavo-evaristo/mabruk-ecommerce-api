import 'dotenv/config';
import { defineConfig } from 'prisma/config';

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
  },
  datasource: {
    // Para migrate usa a conexão direta (5432); em runtime o app usa
    // DATABASE_URL via PrismaPg adapter (pooler 6543).
    url: process.env['DATABASE_URL'],
  },
});
