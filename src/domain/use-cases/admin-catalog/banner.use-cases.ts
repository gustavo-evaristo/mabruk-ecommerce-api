import { Injectable, NotFoundException } from '@nestjs/common';
import { IBannerRepository } from 'src/domain/repositories/banner.repository';
import { BannerEntity } from 'src/domain/entities/banner.entity';

@Injectable()
export class ListBannersAdminUseCase {
  constructor(private readonly repository: IBannerRepository) {}
  async execute(): Promise<BannerEntity[]> {
    return this.repository.list();
  }
}

interface CreateBannerInput {
  imageUrl: string;
  mobileImageUrl?: string;
  linkUrl?: string;
  alt?: string;
  order?: number;
  isActive?: boolean;
  startsAt?: Date;
  endsAt?: Date;
}

@Injectable()
export class CreateBannerUseCase {
  constructor(private readonly repository: IBannerRepository) {}
  async execute(input: CreateBannerInput): Promise<BannerEntity> {
    const b = new BannerEntity(input);
    await this.repository.create(b);
    return b;
  }
}

interface UpdateBannerInput extends Partial<CreateBannerInput> {
  id: string;
}

@Injectable()
export class UpdateBannerUseCase {
  constructor(private readonly repository: IBannerRepository) {}
  async execute(input: UpdateBannerInput): Promise<BannerEntity> {
    const b = await this.repository.get(input.id);
    if (!b) throw new NotFoundException('Banner not found');
    b.update(input);
    await this.repository.update(b);
    return b;
  }
}

@Injectable()
export class DeleteBannerUseCase {
  constructor(private readonly repository: IBannerRepository) {}
  async execute(id: string): Promise<void> {
    const b = await this.repository.get(id);
    if (!b) throw new NotFoundException('Banner not found');
    await this.repository.delete(id);
  }
}
