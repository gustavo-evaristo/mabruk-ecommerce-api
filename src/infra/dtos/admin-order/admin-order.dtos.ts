import { ApiProperty } from '@nestjs/swagger';
import { IsIn, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class UpdateOrderStatusDTO {
  @IsIn(['PENDING_PAYMENT', 'PAID', 'PREPARING', 'SHIPPED', 'DELIVERED', 'CANCELED', 'REFUNDED'])
  @ApiProperty()
  status:
    | 'PENDING_PAYMENT'
    | 'PAID'
    | 'PREPARING'
    | 'SHIPPED'
    | 'DELIVERED'
    | 'CANCELED'
    | 'REFUNDED';
}

export class AttachInvoiceDTO {
  @IsString() @IsNotEmpty() @ApiProperty() invoiceNumber: string;
}

export class AttachTrackingDTO {
  @IsString() @IsNotEmpty() @ApiProperty() trackingCode: string;
  @IsOptional() @IsString() @ApiProperty({ required: false }) carrier?: string;
}
