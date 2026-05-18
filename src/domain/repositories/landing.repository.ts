import { LandingEntity } from '../entities/landing.entity';

export abstract class ILandingRepository {
  abstract list(): Promise<LandingEntity[]>;
  abstract get(id: string): Promise<LandingEntity | null>;
  abstract findBySlug(slug: string): Promise<LandingEntity | null>;
  abstract create(l: LandingEntity): Promise<void>;
  abstract update(l: LandingEntity): Promise<void>;
  abstract delete(id: string): Promise<void>;
}
