import { Module } from '@nestjs/common';
import { DatabaseModule } from '../database/database.module';
import { CepController } from './b2c/utils/cep.controller';
import { StoreConfigController } from './b2c/utils/store-config.controller';

@Module({
  imports: [DatabaseModule],
  controllers: [CepController, StoreConfigController],
})
export class UtilsModule {}
