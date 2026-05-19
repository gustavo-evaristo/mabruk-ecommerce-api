import { Logger, Module } from '@nestjs/common';
import { ImageStorage } from 'src/domain/services/image-storage';
import { LocalImageStorage } from './local-image.storage';
import { SupabaseImageStorage } from './supabase-image.storage';

/**
 * Resolve o provider de storage no momento da instanciação do módulo
 * (depois do ConfigModule carregar o .env):
 *  - SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY → Supabase Storage
 *  - caso contrário → storage local em disco (dev)
 */
@Module({
  providers: [
    {
      provide: ImageStorage,
      useFactory: (): ImageStorage => {
        const logger = new Logger('StorageModule');
        if (process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
          logger.log('Usando SupabaseImageStorage');
          return new SupabaseImageStorage();
        }
        logger.log('Usando LocalImageStorage (sem SUPABASE_URL/SERVICE_ROLE_KEY)');
        return new LocalImageStorage();
      },
    },
  ],
  exports: [ImageStorage],
})
export class StorageModule {}
