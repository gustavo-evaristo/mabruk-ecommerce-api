import { Injectable, NotFoundException } from '@nestjs/common';
import { ILandingRepository } from 'src/domain/repositories/landing.repository';
import { LandingBlock, LandingEntity, LandingStatus } from 'src/domain/entities/landing.entity';
import { Slug } from 'src/domain/entities/vos';

interface CreateInput {
  slug?: string;
  name: string;
  blocks?: LandingBlock[];
  seoTitle?: string;
  seoDescription?: string;
  status?: LandingStatus;
}

@Injectable()
export class ListLandingsUseCase {
  constructor(private readonly repo: ILandingRepository) {}
  async execute(): Promise<LandingEntity[]> {
    return this.repo.list();
  }
}

@Injectable()
export class GetLandingUseCase {
  constructor(private readonly repo: ILandingRepository) {}
  async execute(id: string): Promise<LandingEntity> {
    const l = await this.repo.get(id);
    if (!l) throw new NotFoundException('Landing not found');
    return l;
  }
}

@Injectable()
export class GetLandingBySlugUseCase {
  constructor(private readonly repo: ILandingRepository) {}
  async execute(slug: string): Promise<LandingEntity | null> {
    return this.repo.findBySlug(slug);
  }
}

@Injectable()
export class CreateLandingUseCase {
  constructor(private readonly repo: ILandingRepository) {}
  async execute(input: CreateInput): Promise<LandingEntity> {
    const slug = input.slug ?? Slug.fromText(input.name).value;
    const l = new LandingEntity({ ...input, slug });
    await this.repo.create(l);
    return l;
  }
}

interface UpdateInput extends Partial<CreateInput> {
  id: string;
}

@Injectable()
export class UpdateLandingUseCase {
  constructor(private readonly repo: ILandingRepository) {}
  async execute(input: UpdateInput): Promise<LandingEntity> {
    const l = await this.repo.get(input.id);
    if (!l) throw new NotFoundException('Landing not found');
    l.update(input);
    await this.repo.update(l);
    return l;
  }
}

@Injectable()
export class DeleteLandingUseCase {
  constructor(private readonly repo: ILandingRepository) {}
  async execute(id: string): Promise<void> {
    await this.repo.delete(id);
  }
}
