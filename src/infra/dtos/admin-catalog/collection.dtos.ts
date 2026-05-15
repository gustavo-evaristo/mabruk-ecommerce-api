import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsBoolean, IsInt, IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';

export class CreateCollectionDTO {
  @IsString() @IsNotEmpty() @ApiProperty({ example: 'Verão 2026' }) name: string;
  @IsOptional() @IsString() @ApiPropertyOptional() slug?: string;
  @IsOptional() @IsString() @ApiPropertyOptional() description?: string;
  @IsOptional() @IsString() @ApiPropertyOptional() coverImageUrl?: string;
  @IsOptional() @IsInt() @ApiPropertyOptional() order?: number;
  @IsOptional() @IsBoolean() @ApiPropertyOptional() isActive?: boolean;
}

export class UpdateCollectionDTO {
  @IsOptional() @IsString() @ApiPropertyOptional() name?: string;
  @IsOptional() @IsString() @ApiPropertyOptional() slug?: string;
  @IsOptional() @IsString() @ApiPropertyOptional() description?: string;
  @IsOptional() @IsString() @ApiPropertyOptional() coverImageUrl?: string;
  @IsOptional() @IsInt() @ApiPropertyOptional() order?: number;
  @IsOptional() @IsBoolean() @ApiPropertyOptional() isActive?: boolean;
}

export class SetCollectionProductsDTO {
  @IsArray() @IsUUID('all', { each: true }) @ApiProperty({ type: [String] }) productIds: string[];
}
