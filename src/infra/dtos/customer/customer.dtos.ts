import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class SignupCustomerDTO {
  @IsString() @IsNotEmpty() @ApiProperty({ example: 'Ana Silva' }) name: string;
  @IsString() @IsEmail() @ApiProperty({ example: 'ana@email.com' }) email: string;
  @IsOptional() @IsString() @ApiPropertyOptional({ example: '11999999999' }) phone?: string;
  @IsOptional() @IsString() @ApiPropertyOptional() cpfCnpj?: string;
  @IsString() @IsNotEmpty() @ApiProperty({ example: 'Mabruk@2026' }) password: string;
  @IsString() @IsNotEmpty() @ApiProperty({ example: 'Mabruk@2026' }) confirmPassword: string;
}

export class LoginCustomerDTO {
  @IsString() @IsEmail() @ApiProperty({ example: 'ana@email.com' }) email: string;
  @IsString() @IsNotEmpty() @ApiProperty({ example: 'Mabruk@2026' }) password: string;
}

export class UpdateProfileDTO {
  @IsOptional() @IsString() @ApiPropertyOptional() name?: string;
  @IsOptional() @IsString() @ApiPropertyOptional() phone?: string;
  @IsOptional() @IsString() @ApiPropertyOptional() cpfCnpj?: string;
}

export class ChangePasswordDTO {
  @IsString() @IsNotEmpty() @ApiProperty() currentPassword: string;
  @IsString() @IsNotEmpty() @ApiProperty() newPassword: string;
  @IsString() @IsNotEmpty() @ApiProperty() confirmPassword: string;
}

export class CreateAddressDTO {
  @IsOptional() @IsString() @ApiPropertyOptional() label?: string;
  @IsString() @IsNotEmpty() @ApiProperty() recipient: string;
  @IsString() @IsNotEmpty() @ApiProperty({ example: '01310100' }) zipCode: string;
  @IsString() @IsNotEmpty() @ApiProperty() street: string;
  @IsString() @IsNotEmpty() @ApiProperty() number: string;
  @IsOptional() @IsString() @ApiPropertyOptional() complement?: string;
  @IsString() @IsNotEmpty() @ApiProperty() neighborhood: string;
  @IsString() @IsNotEmpty() @ApiProperty() city: string;
  @IsString() @IsNotEmpty() @ApiProperty({ example: 'SP' }) state: string;
  @IsOptional() @IsBoolean() @ApiPropertyOptional() isDefault?: boolean;
}

export class UpdateAddressDTO {
  @IsOptional() @IsString() @ApiPropertyOptional() label?: string;
  @IsOptional() @IsString() @ApiPropertyOptional() recipient?: string;
  @IsOptional() @IsString() @ApiPropertyOptional() zipCode?: string;
  @IsOptional() @IsString() @ApiPropertyOptional() street?: string;
  @IsOptional() @IsString() @ApiPropertyOptional() number?: string;
  @IsOptional() @IsString() @ApiPropertyOptional() complement?: string;
  @IsOptional() @IsString() @ApiPropertyOptional() neighborhood?: string;
  @IsOptional() @IsString() @ApiPropertyOptional() city?: string;
  @IsOptional() @IsString() @ApiPropertyOptional() state?: string;
  @IsOptional() @IsBoolean() @ApiPropertyOptional() isDefault?: boolean;
}
