import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsIn,
  IsInt,
  IsNotEmpty,
  IsNumber,
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

  @IsOptional()
  @IsIn(['SIMPLE', 'VARIABLE'])
  @ApiPropertyOptional({ example: 'SIMPLE' })
  type?: 'SIMPLE' | 'VARIABLE';

  @IsUUID()
  @ApiProperty({ description: 'ID da categoria' })
  categoryId: string;

  @IsInt()
  @Min(0)
  @ApiProperty({ example: 14990, description: 'Preço base em centavos' })
  basePriceCents: number;

  /** SKU único (obrigatório se type=SIMPLE) */
  @IsOptional()
  @IsString()
  @ApiPropertyOptional({ example: 'CLO-001' })
  sku?: string;

  /** Preço em centavos (obrigatório se type=SIMPLE) */
  @IsOptional()
  @IsInt()
  @Min(0)
  @ApiPropertyOptional({ example: 14990 })
  priceCents?: number;

  /** Estoque (só usado em type=SIMPLE) */
  @IsOptional()
  @IsInt()
  @Min(0)
  @ApiPropertyOptional({ example: 5 })
  stock?: number;

  /** IDs dos atributos que esse produto usa (obrigatório e não vazio se type=VARIABLE) */
  @IsOptional()
  @IsArray()
  @IsUUID('all', { each: true })
  @ApiPropertyOptional({ type: [String] })
  attributeIds?: string[];

  @IsOptional()
  @IsNumber()
  @Min(0)
  @ApiPropertyOptional({ example: 2.5 })
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
  @IsOptional() @IsString() @ApiPropertyOptional() sku?: string;
  @IsOptional() @IsInt() @Min(0) @ApiPropertyOptional() priceCents?: number;
  @IsOptional() @IsInt() @Min(0) @ApiPropertyOptional() stock?: number;
  @IsOptional() @IsNumber() @Min(0) @ApiPropertyOptional() weightInGrams?: number;
  @IsOptional() @ApiPropertyOptional() dimensionLength?: number;
  @IsOptional() @ApiPropertyOptional() dimensionWidth?: number;
  @IsOptional() @ApiPropertyOptional() dimensionHeight?: number;
  @IsOptional() @IsString() @ApiPropertyOptional() seoTitle?: string;
  @IsOptional() @IsString() @ApiPropertyOptional() seoDescription?: string;
  @IsOptional() @IsArray() @IsUUID('all', { each: true }) @ApiPropertyOptional({ type: [String] }) tagIds?: string[];
}

export class CreateVariantDTO {
  @IsString() @IsNotEmpty() @ApiProperty({ example: 'CLO-OURO-16' }) sku: string;
  /** Lista de attribute_value IDs — um por atributo do produto */
  @IsArray() @IsUUID('all', { each: true }) @ApiProperty({ type: [String] })
  attributeValueIds: string[];
  @IsInt() @Min(0) @ApiProperty({ example: 14990 }) priceCents: number;
  @IsOptional() @IsInt() @Min(0) @ApiPropertyOptional({ example: 10 }) stock?: number;
  @IsOptional() @ApiPropertyOptional() isActive?: boolean;
  @IsOptional() @IsNumber() @Min(0) @ApiPropertyOptional({ example: 2.5 }) weightInGrams?: number;
}

export class UpdateVariantDTO {
  @IsOptional() @IsString() @ApiPropertyOptional() sku?: string;
  @IsOptional() @IsArray() @IsUUID('all', { each: true }) @ApiPropertyOptional({ type: [String] })
  attributeValueIds?: string[];
  @IsOptional() @IsInt() @Min(0) @ApiPropertyOptional() priceCents?: number;
  @IsOptional() @IsInt() @Min(0) @ApiPropertyOptional() stock?: number;
  @IsOptional() @ApiPropertyOptional() isActive?: boolean;
  @IsOptional() @IsNumber() @Min(0) @ApiPropertyOptional() weightInGrams?: number;
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
