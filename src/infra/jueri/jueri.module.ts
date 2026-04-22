import { Global, Module } from '@nestjs/common';
import { JueriHttpService } from './jueri-http.service';

@Global()
@Module({
  providers: [JueriHttpService],
  exports: [JueriHttpService],
})
export class JueriModule {}
