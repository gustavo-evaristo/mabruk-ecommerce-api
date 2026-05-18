import {
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AdminJwtGuard } from 'src/infra/authentication/admin-jwt.guard';
import {
  DeleteReviewUseCase,
  ListReviewsAdminUseCase,
  ModerateReviewUseCase,
} from 'src/domain/use-cases/reviews';
import type { ReviewEntity, ReviewStatus } from 'src/domain/entities/review.entity';

const present = (r: ReviewEntity) => ({
  id: r.id.toString(),
  productId: r.productId.toString(),
  customerId: r.customerId.toString(),
  rating: r.rating,
  comment: r.comment,
  status: r.status,
  createdAt: r.createdAt,
});

@ApiTags('B2B / Reviews')
@ApiBearerAuth()
@UseGuards(AdminJwtGuard)
@Controller('b2b/reviews')
export class AdminReviewsController {
  constructor(
    private readonly listUC: ListReviewsAdminUseCase,
    private readonly moderateUC: ModerateReviewUseCase,
    private readonly deleteUC: DeleteReviewUseCase,
  ) {}

  @Get()
  async list(@Query('status') status?: ReviewStatus) {
    const items = await this.listUC.execute({ status });
    return { items: items.map(present) };
  }

  @Patch(':id/approve')
  async approve(@Param('id') id: string) {
    return present(await this.moderateUC.execute(id, 'APPROVED'));
  }

  @Patch(':id/reject')
  async reject(@Param('id') id: string) {
    return present(await this.moderateUC.execute(id, 'REJECTED'));
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    await this.deleteUC.execute(id);
    return { ok: true };
  }
}
