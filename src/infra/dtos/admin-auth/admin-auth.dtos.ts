import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class AdminLoginDTO {
  @IsString() @IsEmail() @ApiProperty({ example: 'admin@mabruk.com.br' }) email: string;
  @IsString() @IsNotEmpty() @ApiProperty({ example: 'Mabruk@2026' }) password: string;
}

export class AdminChangePasswordDTO {
  @IsString() @IsNotEmpty() @ApiProperty() currentPassword: string;
  @IsString() @IsNotEmpty() @ApiProperty() newPassword: string;
  @IsString() @IsNotEmpty() @ApiProperty() confirmPassword: string;
}
