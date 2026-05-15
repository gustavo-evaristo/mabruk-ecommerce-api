import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsOptional, IsUUID, Min } from 'class-validator';

export class CreateCartDTO {
  @IsOptional() @IsUUID() @ApiPropertyOptional() customerId?: string;
}

export class AddCartItemDTO {
  @IsUUID() @ApiProperty() variantId: string;
  @IsInt() @Min(1) @ApiProperty({ example: 1 }) quantity: number;
}

export class UpdateCartItemDTO {
  @IsInt() @Min(1) @ApiProperty({ example: 2 }) quantity: number;
}
