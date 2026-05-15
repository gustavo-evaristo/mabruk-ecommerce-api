import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { ITagRepository } from 'src/domain/repositories/tag.repository';
import { TagEntity } from 'src/domain/entities/tag.entity';
import { Slug } from 'src/domain/entities/vos';

@Injectable()
export class CreateTagUseCase {
  constructor(private readonly repository: ITagRepository) {}

  async execute(input: { name: string; slug?: string }): Promise<TagEntity> {
    const slug = input.slug ? Slug.from(input.slug).value : Slug.fromText(input.name).value;
    if (await this.repository.findBySlug(slug)) {
      throw new ConflictException(`Tag slug "${slug}" already in use`);
    }
    const t = new TagEntity({ slug, name: input.name });
    await this.repository.create(t);
    return t;
  }
}

@Injectable()
export class UpdateTagUseCase {
  constructor(private readonly repository: ITagRepository) {}

  async execute(input: { id: string; name?: string; slug?: string }): Promise<TagEntity> {
    const t = await this.repository.get(input.id);
    if (!t) throw new NotFoundException('Tag not found');
    if (input.slug && input.slug !== t.slug) {
      if (await this.repository.findBySlug(input.slug)) {
        throw new ConflictException('Slug already in use');
      }
      t.slug = input.slug;
    }
    if (input.name !== undefined) t.name = input.name;
    await this.repository.update(t);
    return t;
  }
}

@Injectable()
export class DeleteTagUseCase {
  constructor(private readonly repository: ITagRepository) {}

  async execute(id: string): Promise<void> {
    const t = await this.repository.get(id);
    if (!t) throw new NotFoundException('Tag not found');
    await this.repository.delete(id);
  }
}
