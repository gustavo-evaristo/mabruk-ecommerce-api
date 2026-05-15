export interface UploadInput {
  buffer: Buffer;
  mimeType: string;
  fileName: string;
  folder?: string;
}

export interface UploadOutput {
  url: string;
  path: string;
}

export abstract class ImageStorage {
  abstract readonly providerName: string;
  abstract upload(input: UploadInput): Promise<UploadOutput>;
  abstract delete(pathOrUrl: string): Promise<void>;
}
