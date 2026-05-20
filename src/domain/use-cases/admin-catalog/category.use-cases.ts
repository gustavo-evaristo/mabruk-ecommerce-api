import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { ICategoryRepository } from 'src/domain/repositories/category.repository';
import { CategoryEntity } from 'src/domain/entities/category.entity';
import { ImageStorage } from 'src/domain/services/image-storage';
import { Slug } from 'src/domain/entities/vos';

interface CreateCategoryInput {
  name: string;
  slug?: string;
  imageUrl?: string | null;
  order?: number;
  isActive?: boolean;
}

@Injectable()
export class CreateCategoryUseCase {
  constructor(private readonly repository: ICategoryRepository) {}

  async execute(input: CreateCategoryInput): Promise<CategoryEntity> {
    const slug = input.slug ? Slug.from(input.slug).value : Slug.fromText(input.name).value;
    const exists = await this.repository.findBySlug(slug);
    if (exists) throw new ConflictException(`Category slug "${slug}" already in use`);
    const c = new CategoryEntity({
      slug,
      name: input.name,
      imageUrl: input.imageUrl,
      order: input.order ?? 0,
      isActive: input.isActive ?? true,
    });
    await this.repository.create(c);
    return c;
  }
}

interface UpdateCategoryInput {
  id: string;
  name?: string;
  slug?: string;
  imageUrl?: string | null;
  order?: number;
  isActive?: boolean;
}

@Injectable()
export class UpdateCategoryUseCase {
  constructor(private readonly repository: ICategoryRepository) {}

  async execute(input: UpdateCategoryInput): Promise<CategoryEntity> {
    const c = await this.repository.get(input.id);
    if (!c) throw new NotFoundException('Category not found');
    if (input.slug && input.slug !== c.slug) {
      const exists = await this.repository.findBySlug(input.slug);
      if (exists) throw new ConflictException(`Slug "${input.slug}" already in use`);
    }
    c.update({
      name: input.name,
      slug: input.slug,
      imageUrl: input.imageUrl,
      order: input.order,
      isActive: input.isActive,
    });
    await this.repository.update(c);
    return c;
  }
}

interface UploadCategoryImageInput {
  id: string;
  buffer: Buffer;
  mimeType: string;
  originalName: string;
}

@Injectable()
export class UploadCategoryImageUseCase {
  constructor(
    private readonly repository: ICategoryRepository,
    private readonly storage: ImageStorage,
  ) {}

  async execute(input: UploadCategoryImageInput): Promise<CategoryEntity> {
    const c = await this.repository.get(input.id);
    if (!c) throw new NotFoundException('Category not found');

    const upload = await this.storage.upload({
      buffer: input.buffer,
      mimeType: input.mimeType,
      fileName: input.originalName,
      folder: `categories/${input.id}`,
    });

    c.update({ imageUrl: upload.url });
    await this.repository.update(c);
    return c;
  }
}

@Injectable()
export class DeleteCategoryUseCase {
  constructor(private readonly repository: ICategoryRepository) {}

  async execute(id: string): Promise<void> {
    const c = await this.repository.get(id);
    if (!c) throw new NotFoundException('Category not found');
    await this.repository.delete(id);
  }
}
