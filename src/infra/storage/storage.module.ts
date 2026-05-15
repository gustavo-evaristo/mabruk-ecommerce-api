import { Module } from '@nestjs/common';
import { ImageStorage } from 'src/domain/services/image-storage';
import { LocalImageStorage } from './local-image.storage';

@Module({
  providers: [{ provide: ImageStorage, useClass: LocalImageStorage }],
  exports: [ImageStorage],
})
export class StorageModule {}
