import { Injectable, Logger } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { ImageStorage, UploadInput, UploadOutput } from 'src/domain/services/image-storage';

/**
 * Storage de imagens no Supabase Storage.
 *
 * Variáveis de ambiente necessárias:
 *  - SUPABASE_URL                — URL do projeto Supabase
 *  - SUPABASE_SERVICE_ROLE_KEY   — chave service role (bypassa RLS, usar só no backend)
 *  - SUPABASE_STORAGE_BUCKET     — nome do bucket (default: `mabruk-uploads`)
 *
 * O bucket deve estar marcado como público no painel do Supabase pra `getPublicUrl`
 * funcionar sem signed URLs. Se preferir privado, trocar `getPublicUrl` por
 * `createSignedUrl` com expiração longa.
 */
@Injectable()
export class SupabaseImageStorage extends ImageStorage {
  readonly providerName = 'supabase';
  private readonly logger = new Logger(SupabaseImageStorage.name);
  private readonly client: SupabaseClient;
  private readonly bucket: string;

  constructor() {
    super();
    const url = process.env.SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !key) {
      throw new Error(
        'SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY são obrigatórios para SupabaseImageStorage',
      );
    }
    this.client = createClient(url, key, {
      auth: { persistSession: false },
    });
    this.bucket = process.env.SUPABASE_STORAGE_BUCKET ?? 'mabruk-uploads';
  }

  private extFromMime(mime: string): string {
    const map: Record<string, string> = {
      'image/png': 'png',
      'image/jpeg': 'jpg',
      'image/jpg': 'jpg',
      'image/webp': 'webp',
      'image/avif': 'avif',
    };
    return map[mime.toLowerCase()] ?? 'bin';
  }

  async upload(input: UploadInput): Promise<UploadOutput> {
    const folder = input.folder ? input.folder.replace(/^\/+|\/+$/g, '') : 'misc';
    const ext = this.extFromMime(input.mimeType);
    const objectPath = `${folder}/${randomUUID()}.${ext}`;

    const { error } = await this.client.storage
      .from(this.bucket)
      .upload(objectPath, input.buffer, {
        contentType: input.mimeType,
        upsert: false,
      });

    if (error) {
      this.logger.error(`[Supabase] upload falhou: ${error.message}`);
      throw new Error(`Falha ao subir imagem: ${error.message}`);
    }

    const { data } = this.client.storage.from(this.bucket).getPublicUrl(objectPath);
    this.logger.log(`[Supabase] saved ${objectPath} (${input.buffer.length} bytes)`);

    return { url: data.publicUrl, path: objectPath };
  }

  async delete(pathOrUrl: string): Promise<void> {
    // Aceita tanto path relativo ("products/abc.jpg") quanto URL pública completa
    let objectPath = pathOrUrl;
    const marker = `/${this.bucket}/`;
    const idx = pathOrUrl.indexOf(marker);
    if (idx >= 0) {
      objectPath = pathOrUrl.slice(idx + marker.length);
    }

    const { error } = await this.client.storage.from(this.bucket).remove([objectPath]);
    if (error) {
      this.logger.warn(`[Supabase] delete falhou para ${objectPath}: ${error.message}`);
    } else {
      this.logger.log(`[Supabase] deleted ${objectPath}`);
    }
  }
}
