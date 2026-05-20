import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsInt, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateCategoryDTO {
  @IsString() @IsNotEmpty() @ApiProperty({ example: 'Anéis' }) name: string;
  @IsOptional() @IsString() @ApiPropertyOptional({ example: 'aneis' }) slug?: string;
  @IsOptional() @IsString() @ApiPropertyOptional() imageUrl?: string;
  @IsOptional() @IsInt() @ApiPropertyOptional({ example: 0 }) order?: number;
  @IsOptional() @IsBoolean() @ApiPropertyOptional({ example: true }) isActive?: boolean;
}

export class UpdateCategoryDTO {
  @IsOptional() @IsString() @ApiPropertyOptional() name?: string;
  @IsOptional() @IsString() @ApiPropertyOptional() slug?: string;
  @IsOptional() @IsString() @ApiPropertyOptional() imageUrl?: string;
  @IsOptional() @IsInt() @ApiPropertyOptional() order?: number;
  @IsOptional() @IsBoolean() @ApiPropertyOptional() isActive?: boolean;
}
