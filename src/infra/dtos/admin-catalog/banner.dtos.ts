import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsBoolean, IsDate, IsInt, IsOptional, IsString } from 'class-validator';

export class CreateBannerDTO {
  @IsString() @ApiProperty({ example: 'https://.../banner.jpg' }) imageUrl: string;
  @IsOptional() @IsString() @ApiPropertyOptional() mobileImageUrl?: string;
  @IsOptional() @IsString() @ApiPropertyOptional() linkUrl?: string;
  @IsOptional() @IsString() @ApiPropertyOptional() alt?: string;
  @IsOptional() @IsInt() @ApiPropertyOptional() order?: number;
  @IsOptional() @IsBoolean() @ApiPropertyOptional() isActive?: boolean;
  @IsOptional() @IsDate() @Type(() => Date) @ApiPropertyOptional() startsAt?: Date;
  @IsOptional() @IsDate() @Type(() => Date) @ApiPropertyOptional() endsAt?: Date;
}

export class UpdateBannerDTO {
  @IsOptional() @IsString() @ApiPropertyOptional() imageUrl?: string;
  @IsOptional() @IsString() @ApiPropertyOptional() mobileImageUrl?: string;
  @IsOptional() @IsString() @ApiPropertyOptional() linkUrl?: string;
  @IsOptional() @IsString() @ApiPropertyOptional() alt?: string;
  @IsOptional() @IsInt() @ApiPropertyOptional() order?: number;
  @IsOptional() @IsBoolean() @ApiPropertyOptional() isActive?: boolean;
  @IsOptional() @IsDate() @Type(() => Date) @ApiPropertyOptional() startsAt?: Date;
  @IsOptional() @IsDate() @Type(() => Date) @ApiPropertyOptional() endsAt?: Date;
}
