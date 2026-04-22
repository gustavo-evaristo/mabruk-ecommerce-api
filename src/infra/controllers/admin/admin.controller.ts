import { Controller, Patch, Param, Body } from '@nestjs/common';
import { IsBoolean, IsNumber, IsOptional } from 'class-validator';
import { UpdateProductFlagsUseCase } from '../../../domain/use-cases/products/update-product-flags.use-case';

class UpdateFlagsDto {
  @IsOptional() @IsBoolean() isFeatured?: boolean;
  @IsOptional() @IsBoolean() isRecommended?: boolean;
  @IsOptional() @IsBoolean() isFavorite?: boolean;
  @IsOptional() @IsNumber() displayOrder?: number;
}

@Controller('admin/products')
export class AdminController {
  constructor(private readonly updateProductFlags: UpdateProductFlagsUseCase) {}

  @Patch(':id')
  async updateFlags(@Param('id') id: string, @Body() body: UpdateFlagsDto) {
    await this.updateProductFlags.execute({ id, ...body });
    return { ok: true };
  }
}
