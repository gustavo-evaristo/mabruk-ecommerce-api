import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  ValidateNested,
} from 'class-validator';

export class QuoteShippingDTO {
  @IsUUID() @ApiProperty() cartId: string;
  @IsString() @ApiProperty({ example: '01310100' }) zipCode: string;
}

export class CheckoutCustomerDTO {
  @IsString() @IsNotEmpty() @ApiProperty() name: string;
  @IsString() @IsEmail() @ApiProperty() email: string;
  @IsOptional() @IsString() @ApiPropertyOptional() phone?: string;
  @IsOptional() @IsString() @ApiPropertyOptional() cpf?: string;
}

export class CheckoutAddressDTO {
  @IsString() @IsNotEmpty() @ApiProperty() recipient: string;
  @IsString() @IsNotEmpty() @ApiProperty() zipCode: string;
  @IsString() @IsNotEmpty() @ApiProperty() street: string;
  @IsString() @IsNotEmpty() @ApiProperty() number: string;
  @IsOptional() @IsString() @ApiPropertyOptional() complement?: string;
  @IsString() @IsNotEmpty() @ApiProperty() neighborhood: string;
  @IsString() @IsNotEmpty() @ApiProperty() city: string;
  @IsString() @IsNotEmpty() @ApiProperty() state: string;
}

export class CheckoutShippingChoiceDTO {
  @IsString() @ApiProperty({ example: 'PAC' }) service: string;
  @IsString() @ApiProperty({ example: 'Correios' }) carrier: string;
}

export class CreateOrderDTO {
  @IsUUID() @ApiProperty() cartId: string;

  @ValidateNested() @Type(() => CheckoutCustomerDTO) @ApiProperty({ type: CheckoutCustomerDTO })
  customer: CheckoutCustomerDTO;

  @ValidateNested() @Type(() => CheckoutAddressDTO) @ApiProperty({ type: CheckoutAddressDTO })
  shippingAddress: CheckoutAddressDTO;

  @ValidateNested() @Type(() => CheckoutShippingChoiceDTO) @ApiProperty({ type: CheckoutShippingChoiceDTO })
  shippingChoice: CheckoutShippingChoiceDTO;

  @IsOptional() @IsString() @ApiPropertyOptional() notes?: string;
}
