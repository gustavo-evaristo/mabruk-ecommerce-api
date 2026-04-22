import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { Logger } from '@nestjs/common';
import { AppModule } from '../src/app.module';
import { SyncCatalogUseCase } from '../src/domain/use-cases/sync/sync-catalog.use-case';

async function main() {
  const logger = new Logger('seed-jueri');
  logger.log('Bootstrapping NestJS context...');

  const app = await NestFactory.createApplicationContext(AppModule, {
    logger: ['log', 'warn', 'error'],
  });

  const syncUseCase = app.get(SyncCatalogUseCase);

  logger.log('Starting catalog seed from Jueri...');
  const result = await syncUseCase.execute();

  logger.log(
    `Done — categories: ${result.categories}, subcategories: ${result.subcategories}, products: ${result.products.upserted} upserted / ${result.products.deactivated} deactivated`,
  );

  await app.close();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
