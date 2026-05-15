import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsString, Min } from 'class-validator';

export class CreateCardPaymentDTO {
  @IsString() @IsNotEmpty() @ApiProperty({ example: 'tok_visa_4242' }) cardToken: string;
  @IsInt() @Min(1) @ApiProperty({ example: 1 }) installments: number;
}
