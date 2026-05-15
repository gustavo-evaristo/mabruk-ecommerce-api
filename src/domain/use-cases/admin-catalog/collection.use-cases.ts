import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { ICollectionRepository } from 'src/domain/repositories/collection.repository';
import { CollectionEntity } from 'src/domain/entities/collection.entity';
import { Slug } from 'src/domain/entities/vos';

interface CreateCollectionInput {
  name: string;
  slug?: string;
  description?: string;
  coverImageUrl?: string;
  order?: number;
  isActive?: boolean;
}

@Injectable()
export class CreateCollectionUseCase {
  constructor(private readonly repository: ICollectionRepository) {}

  async execute(input: CreateCollectionInput): Promise<CollectionEntity> {
    const slug = input.slug ? Slug.from(input.slug).value : Slug.fromText(input.name).value;
    if (await this.repository.findBySlug(slug)) {
      throw new ConflictException(`Collection slug "${slug}" already in use`);
    }
    const c = new CollectionEntity({
      slug,
      name: input.name,
      description: input.description,
      coverImageUrl: input.coverImageUrl,
      order: input.order,
      isActive: input.isActive,
    });
    await this.repository.create(c);
    return c;
  }
}

interface UpdateCollectionInput {
  id: string;
  name?: string;
  slug?: string;
  description?: string | null;
  coverImageUrl?: string | null;
  order?: number;
  isActive?: boolean;
}

@Injectable()
export class UpdateCollectionUseCase {
  constructor(private readonly repository: ICollectionRepository) {}

  async execute(input: UpdateCollectionInput): Promise<CollectionEntity> {
    const c = await this.repository.get(input.id);
    if (!c) throw new NotFoundException('Collection not found');
    if (input.slug && input.slug !== c.slug) {
      const exists = await this.repository.findBySlug(input.slug);
      if (exists) throw new ConflictException(`Slug already in use`);
    }
    c.update({
      name: input.name,
      slug: input.slug,
      description: input.description,
      coverImageUrl: input.coverImageUrl,
      order: input.order,
      isActive: input.isActive,
    });
    await this.repository.update(c);
    return c;
  }
}

@Injectable()
export class DeleteCollectionUseCase {
  constructor(private readonly repository: ICollectionRepository) {}

  async execute(id: string): Promise<void> {
    const c = await this.repository.get(id);
    if (!c) throw new NotFoundException('Collection not found');
    await this.repository.delete(id);
  }
}

interface SetCollectionProductsInput {
  collectionId: string;
  productIds: string[];
}

@Injectable()
export class SetCollectionProductsUseCase {
  constructor(private readonly repository: ICollectionRepository) {}

  async execute(input: SetCollectionProductsInput): Promise<void> {
    const c = await this.repository.get(input.collectionId);
    if (!c) throw new NotFoundException('Collection not found');
    await this.repository.setProducts(
      input.collectionId,
      input.productIds.map((productId, idx) => ({ productId, order: idx })),
    );
  }
}
