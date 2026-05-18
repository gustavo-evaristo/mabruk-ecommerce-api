import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { IsString } from 'class-validator';
import { CustomerJwtGuard } from 'src/infra/authentication/customer-jwt.guard';
import { AuthenticatedCustomerRequest } from 'src/infra/authentication/types';
import {
  AddFavoriteUseCase,
  ListCustomerFavoritesUseCase,
  RemoveFavoriteUseCase,
} from 'src/domain/use-cases/customer';
import { presentProductListItem } from 'src/infra/controllers/presenters/product.presenter';

class AddFavoriteDTO {
  @IsString()
  productId!: string;
}

@ApiTags('B2C / Customers / Favorites')
@ApiBearerAuth()
@UseGuards(CustomerJwtGuard)
@Controller('b2c/customers/me/favorites')
export class FavoritesController {
  constructor(
    private readonly listUC: ListCustomerFavoritesUseCase,
    private readonly addUC: AddFavoriteUseCase,
    private readonly removeUC: RemoveFavoriteUseCase,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Lista produtos favoritados do cliente logado' })
  async list(@Req() req: AuthenticatedCustomerRequest) {
    const items = await this.listUC.execute(req.user.id);
    return { items: items.map(presentProductListItem) };
  }

  @Post()
  @ApiOperation({ summary: 'Adiciona produto aos favoritos' })
  async add(@Req() req: AuthenticatedCustomerRequest, @Body() body: AddFavoriteDTO) {
    await this.addUC.execute({ customerId: req.user.id, productId: body.productId });
    return { ok: true };
  }

  @Delete(':productId')
  @ApiOperation({ summary: 'Remove produto dos favoritos' })
  async remove(
    @Req() req: AuthenticatedCustomerRequest,
    @Param('productId') productId: string,
  ) {
    await this.removeUC.execute({ customerId: req.user.id, productId });
    return { ok: true };
  }
}
