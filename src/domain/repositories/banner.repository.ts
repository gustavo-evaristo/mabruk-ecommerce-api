import { BannerEntity } from '../entities/banner.entity';

export abstract class IBannerRepository {
  abstract list(input?: { onlyVisible?: boolean; now?: Date }): Promise<BannerEntity[]>;
  abstract get(id: string): Promise<BannerEntity | null>;
  abstract create(banner: BannerEntity): Promise<void>;
  abstract update(banner: BannerEntity): Promise<void>;
  abstract delete(id: string): Promise<void>;
}
