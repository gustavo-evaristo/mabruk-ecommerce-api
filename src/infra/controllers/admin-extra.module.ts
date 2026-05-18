import { Module } from '@nestjs/common';
import { DatabaseModule } from '../database/database.module';
import { AuthenticationModule } from '../authentication/authentication.module';
import { AdminSettingsController } from './b2b/admin-settings.controller';
import { AdminPromotionsController } from './b2b/admin-promotions.controller';
import { AdminLandingsController } from './b2b/admin-landings.controller';
import { AdminReviewsController } from './b2b/admin-reviews.controller';
import {
  GetAllSettingsUseCase,
  GetSettingsByGroupUseCase,
  UpsertManySettingsUseCase,
  UpsertSettingUseCase,
} from 'src/domain/use-cases/admin-settings';
import {
  CreatePromotionUseCase,
  DeletePromotionUseCase,
  GetPromotionUseCase,
  ListPromotionsUseCase,
  UpdatePromotionUseCase,
  ValidateCouponUseCase,
} from 'src/domain/use-cases/admin-promotions';
import {
  CreateLandingUseCase,
  DeleteLandingUseCase,
  GetLandingBySlugUseCase,
  GetLandingUseCase,
  ListLandingsUseCase,
  UpdateLandingUseCase,
} from 'src/domain/use-cases/admin-landings';
import {
  CreateReviewUseCase,
  DeleteReviewUseCase,
  ListReviewsAdminUseCase,
  ListReviewsByProductB2CUseCase,
  ModerateReviewUseCase,
} from 'src/domain/use-cases/reviews';

@Module({
  imports: [DatabaseModule, AuthenticationModule],
  providers: [
    GetAllSettingsUseCase,
    GetSettingsByGroupUseCase,
    UpsertManySettingsUseCase,
    UpsertSettingUseCase,
    ListPromotionsUseCase,
    GetPromotionUseCase,
    CreatePromotionUseCase,
    UpdatePromotionUseCase,
    DeletePromotionUseCase,
    ValidateCouponUseCase,
    ListLandingsUseCase,
    GetLandingUseCase,
    GetLandingBySlugUseCase,
    CreateLandingUseCase,
    UpdateLandingUseCase,
    DeleteLandingUseCase,
    ListReviewsAdminUseCase,
    ListReviewsByProductB2CUseCase,
    CreateReviewUseCase,
    ModerateReviewUseCase,
    DeleteReviewUseCase,
  ],
  controllers: [
    AdminSettingsController,
    AdminPromotionsController,
    AdminLandingsController,
    AdminReviewsController,
  ],
})
export class AdminExtraModule {}
