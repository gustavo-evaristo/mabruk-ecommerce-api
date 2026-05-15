import { Injectable } from '@nestjs/common';
import { IBannerRepository } from 'src/domain/repositories/banner.repository';
import { BannerEntity } from 'src/domain/entities/banner.entity';

@Injectable()
export class ListBannersB2CUseCase {
  constructor(private readonly bannerRepository: IBannerRepository) {}

  async execute(): Promise<BannerEntity[]> {
    return this.bannerRepository.list({ onlyVisible: true });
  }
}
