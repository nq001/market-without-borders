import {
  IsIn,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class PaymentWebhookDataDto {
  @ApiProperty({ format: 'uuid' })
  @IsUUID()
  order_id: string;

  @ApiProperty({ example: 1000, minimum: 0 })
  @IsInt()
  @Min(0)
  amount: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  payment_id?: string;
}

export class PaymentWebhookDto {
  @ApiProperty({ example: 'evt_123456' })
  @IsString()
  @IsNotEmpty()
  event_id: string;

  @ApiPropertyOptional({ enum: ['payment.succeeded', 'payment.failed'] })
  @IsOptional()
  @IsIn(['payment.succeeded', 'payment.failed'])
  type?: 'payment.succeeded' | 'payment.failed';

  @ApiPropertyOptional({ enum: ['payment.succeeded', 'payment.failed'] })
  @IsOptional()
  @IsIn(['payment.succeeded', 'payment.failed'])
  event_type?: 'payment.succeeded' | 'payment.failed';

  @ApiProperty({ type: PaymentWebhookDataDto })
  @ValidateNested()
  @Type(() => PaymentWebhookDataDto)
  data: PaymentWebhookDataDto;
}
