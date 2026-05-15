import { Module } from '@nestjs/common';
import { CepController } from './b2c/utils/cep.controller';

@Module({
  controllers: [CepController],
})
export class UtilsModule {}
