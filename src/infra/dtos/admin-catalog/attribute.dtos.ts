import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsHexColor,
  IsIn,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';

export class CreateAttributeValueDraftDTO {
  @IsString() @IsNotEmpty() @ApiProperty({ example: 'Azul' }) name: string;
  @IsOptional() @IsString() @ApiPropertyOptional({ example: 'azul' }) slug?: string;
  @IsOptional() @IsHexColor() @ApiPropertyOptional({ example: '#1E40AF' }) hex?: string;
}

export class CreateAttributeDTO {
  @IsString() @IsNotEmpty() @ApiProperty({ example: 'Cor' }) name: string;
  @IsOptional() @IsString() @ApiPropertyOptional({ example: 'cor' }) slug?: string;
  @IsOptional()
  @IsIn(['SELECT', 'COLOR'])
  @ApiPropertyOptional({ example: 'COLOR' })
  type?: 'SELECT' | 'COLOR';
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateAttributeValueDraftDTO)
  @ApiPropertyOptional({ type: [CreateAttributeValueDraftDTO] })
  valueDrafts?: CreateAttributeValueDraftDTO[];
}

export class UpdateAttributeDTO {
  @IsOptional() @IsString() @ApiPropertyOptional() name?: string;
  @IsOptional() @IsString() @ApiPropertyOptional() slug?: string;
  @IsOptional() @IsIn(['SELECT', 'COLOR']) @ApiPropertyOptional() type?: 'SELECT' | 'COLOR';
  @IsOptional() @IsInt() @ApiPropertyOptional() order?: number;
}

export class CreateAttributeValueDTO {
  @IsString() @IsNotEmpty() @ApiProperty({ example: 'Azul' }) name: string;
  @IsOptional() @IsString() @ApiPropertyOptional() slug?: string;
  @IsOptional() @IsHexColor() @ApiPropertyOptional({ example: '#1E40AF' }) hex?: string;
  @IsOptional() @IsInt() @ApiPropertyOptional() order?: number;
}

export class UpdateAttributeValueDTO {
  @IsOptional() @IsString() @ApiPropertyOptional() name?: string;
  @IsOptional() @IsString() @ApiPropertyOptional() slug?: string;
  @IsOptional() @IsHexColor() @ApiPropertyOptional() hex?: string;
  @IsOptional() @IsInt() @ApiPropertyOptional() order?: number;
}

export class GenerateVariantsDTO {
  @IsOptional() @IsInt() @Min(0) @ApiPropertyOptional() defaultPriceCents?: number;
  @IsOptional() @IsInt() @Min(0) @ApiPropertyOptional() defaultStock?: number;
  @IsOptional() @IsString() @ApiPropertyOptional() skuPrefix?: string;
}
