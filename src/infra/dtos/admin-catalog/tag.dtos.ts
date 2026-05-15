import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateTagDTO {
  @IsString() @IsNotEmpty() @ApiProperty({ example: 'Minimalista' }) name: string;
  @IsOptional() @IsString() @ApiPropertyOptional() slug?: string;
}

export class UpdateTagDTO {
  @IsOptional() @IsString() @ApiPropertyOptional() name?: string;
  @IsOptional() @IsString() @ApiPropertyOptional() slug?: string;
}
