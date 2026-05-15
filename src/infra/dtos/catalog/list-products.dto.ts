import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsBoolean, IsIn, IsInt, IsOptional, IsString, Min } from 'class-validator';

export class ListProductsQueryDTO {
  @IsOptional()
  @IsString()
  @ApiPropertyOptional({ example: 'colar' })
  search?: string;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional({ example: 'aneis' })
  category?: string;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional({ example: 'novidades' })
  collection?: string;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional({ example: 'minimalista' })
  tag?: string;

  @IsOptional()
  @IsIn(['OURO_18K', 'RODIO', 'OURO_ROSE'])
  @ApiPropertyOptional({ example: 'OURO_18K' })
  banho?: string;

  @IsOptional()
  @Transform(({ value }) => (value === undefined || value === '' ? undefined : Number(value)))
  @IsInt()
  @Min(0)
  @ApiPropertyOptional({ example: 5000 })
  minPriceCents?: number;

  @IsOptional()
  @Transform(({ value }) => (value === undefined || value === '' ? undefined : Number(value)))
  @IsInt()
  @Min(0)
  @ApiPropertyOptional({ example: 50000 })
  maxPriceCents?: number;

  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  @ApiPropertyOptional({ example: true })
  inStock?: boolean;

  @IsOptional()
  @IsIn(['newest', 'price_asc', 'price_desc', 'name_asc'])
  @ApiPropertyOptional({ example: 'newest' })
  sort?: 'newest' | 'price_asc' | 'price_desc' | 'name_asc';

  @IsOptional()
  @Transform(({ value }) => (value === undefined ? undefined : Number(value)))
  @IsInt()
  @Min(1)
  @ApiPropertyOptional({ example: 1 })
  page?: number;

  @IsOptional()
  @Transform(({ value }) => (value === undefined ? undefined : Number(value)))
  @IsInt()
  @Min(1)
  @ApiPropertyOptional({ example: 20 })
  pageSize?: number;
}
