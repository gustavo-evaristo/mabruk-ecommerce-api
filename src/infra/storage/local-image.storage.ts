import { Injectable, Logger } from '@nestjs/common';
import { promises as fs } from 'fs';
import * as path from 'path';
import { randomUUID } from 'crypto';
import { ImageStorage, UploadInput, UploadOutput } from 'src/domain/services/image-storage';

/**
 * Storage local. Salva em /uploads servidos via static. Útil para desenvolvimento.
 * Em produção substituir por SupabaseImageStorage.
 */
@Injectable()
export class LocalImageStorage extends ImageStorage {
  readonly providerName = 'local';
  private readonly logger = new Logger(LocalImageStorage.name);
  private readonly root = path.resolve(process.cwd(), 'uploads');
  private readonly publicBase =
    process.env.PUBLIC_UPLOADS_URL ?? `http://localhost:${process.env.PORT ?? 3000}/uploads`;

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
    const dir = path.join(this.root, folder);
    await fs.mkdir(dir, { recursive: true });

    const ext = this.extFromMime(input.mimeType);
    const name = `${randomUUID()}.${ext}`;
    const filePath = path.join(dir, name);
    await fs.writeFile(filePath, input.buffer);

    const relPath = `${folder}/${name}`;
    const url = `${this.publicBase}/${relPath}`;
    this.logger.log(`[LocalStorage] saved ${url} (${input.buffer.length} bytes)`);

    return { url, path: relPath };
  }

  async delete(pathOrUrl: string): Promise<void> {
    let relPath = pathOrUrl;
    if (pathOrUrl.startsWith(this.publicBase)) {
      relPath = pathOrUrl.slice(this.publicBase.length).replace(/^\//, '');
    }
    const filePath = path.join(this.root, relPath);
    try {
      await fs.unlink(filePath);
      this.logger.log(`[LocalStorage] deleted ${filePath}`);
    } catch (err) {
      this.logger.warn(`[LocalStorage] delete falhou para ${filePath}: ${err}`);
    }
  }
}
