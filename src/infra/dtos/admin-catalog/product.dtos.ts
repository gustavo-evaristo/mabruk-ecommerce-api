import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsIn,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  Min,
} from 'class-validator';

export class CreateProductDTO {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({ example: 'Colar Lira Ouro' })
  name: string;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional({ example: 'colar-lira-ouro' })
  slug?: string;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional()
  description?: string;

  @IsOptional()
  @IsIn(['DRAFT', 'ACTIVE', 'ARCHIVED'])
  @ApiPropertyOptional({ example: 'DRAFT' })
  status?: 'DRAFT' | 'ACTIVE' | 'ARCHIVED';

  @IsUUID()
  @ApiProperty({ description: 'ID da categoria' })
  categoryId: string;

  @IsInt()
  @Min(0)
  @ApiProperty({ example: 14990, description: 'Preço base em centavos' })
  basePriceCents: number;

  @IsOptional()
  @IsInt()
  @ApiPropertyOptional({ example: 5 })
  weightInGrams?: number;

  @IsOptional()
  @ApiPropertyOptional()
  dimensionLength?: number;

  @IsOptional()
  @ApiPropertyOptional()
  dimensionWidth?: number;

  @IsOptional()
  @ApiPropertyOptional()
  dimensionHeight?: number;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional()
  seoTitle?: string;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional()
  seoDescription?: string;

  @IsOptional()
  @IsArray()
  @IsUUID('all', { each: true })
  @ApiPropertyOptional({ type: [String] })
  tagIds?: string[];
}

export class UpdateProductDTO {
  @IsOptional() @IsString() @ApiPropertyOptional() name?: string;
  @IsOptional() @IsString() @ApiPropertyOptional() slug?: string;
  @IsOptional() @IsString() @ApiPropertyOptional() description?: string;
  @IsOptional() @IsIn(['DRAFT', 'ACTIVE', 'ARCHIVED']) @ApiPropertyOptional() status?: 'DRAFT' | 'ACTIVE' | 'ARCHIVED';
  @IsOptional() @IsUUID() @ApiPropertyOptional() categoryId?: string;
  @IsOptional() @IsInt() @Min(0) @ApiPropertyOptional() basePriceCents?: number;
  @IsOptional() @IsInt() @ApiPropertyOptional() weightInGrams?: number;
  @IsOptional() @ApiPropertyOptional() dimensionLength?: number;
  @IsOptional() @ApiPropertyOptional() dimensionWidth?: number;
  @IsOptional() @ApiPropertyOptional() dimensionHeight?: number;
  @IsOptional() @IsString() @ApiPropertyOptional() seoTitle?: string;
  @IsOptional() @IsString() @ApiPropertyOptional() seoDescription?: string;
  @IsOptional() @IsArray() @IsUUID('all', { each: true }) @ApiPropertyOptional({ type: [String] }) tagIds?: string[];
}

export class CreateVariantDTO {
  @IsString() @IsNotEmpty() @ApiProperty({ example: 'CLO-OURO-16' }) sku: string;
  @IsIn(['OURO_18K', 'PRATA_925', 'ACO_INOX']) @ApiProperty({ example: 'OURO_18K' }) banho: string;
  @IsString() @ApiProperty({ example: '16' }) size: string;
  @IsInt() @Min(0) @ApiProperty({ example: 14990 }) priceCents: number;
  @IsOptional() @IsInt() @Min(0) @ApiPropertyOptional({ example: 10 }) stock?: number;
  @IsOptional() @ApiPropertyOptional() isActive?: boolean;
}

export class UpdateVariantDTO {
  @IsOptional() @IsString() @ApiPropertyOptional() sku?: string;
  @IsOptional() @IsIn(['OURO_18K', 'PRATA_925', 'ACO_INOX']) @ApiPropertyOptional() banho?: string;
  @IsOptional() @IsString() @ApiPropertyOptional() size?: string;
  @IsOptional() @IsInt() @Min(0) @ApiPropertyOptional() priceCents?: number;
  @IsOptional() @ApiPropertyOptional() isActive?: boolean;
}

export class AdjustStockDTO {
  @IsInt() @ApiProperty({ description: 'positivo ou negativo' }) delta: number;
  @IsIn(['MANUAL_IN', 'MANUAL_OUT', 'ADJUSTMENT']) @ApiProperty() reason:
    | 'MANUAL_IN' | 'MANUAL_OUT' | 'ADJUSTMENT';
  @IsOptional() @IsString() @ApiPropertyOptional() notes?: string;
}

export class ReorderImagesDTO {
  @IsArray()
  @IsUUID('all', { each: true })
  @ApiProperty({ type: [String] })
  imageIds: string[];
}
