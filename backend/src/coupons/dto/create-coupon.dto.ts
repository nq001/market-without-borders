import {
  IsString,
  IsNotEmpty,
  IsInt,
  Min,
  Max,
  IsIn,
  IsOptional,
  IsDateString,
  ValidateIf,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateCouponDto {
  @ApiProperty({
    description: 'The unique code for the coupon',
    example: 'SUMMER2024',
  })
  @IsString()
  @IsNotEmpty()
  code: string;

  @ApiProperty({
    description:
      'The discount amount (in cents for FIXED, or percentage e.g., 20 for 20%)',
    example: 20,
    minimum: 1,
  })
  @IsInt()
  @Min(1)
  @ValidateIf((o: CreateCouponDto) => o.discount_type === 'PERCENTAGE')
  @Max(100)
  discount_amount: number;

  @ApiProperty({
    description: 'The type of discount',
    enum: ['PERCENTAGE', 'FIXED'],
    example: 'PERCENTAGE',
  })
  @IsString()
  @IsIn(['PERCENTAGE', 'FIXED'])
  discount_type: 'PERCENTAGE' | 'FIXED';

  @ApiPropertyOptional({
    description: 'Maximum number of times this coupon can be used',
    example: 100,
    minimum: 1,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  usage_limit?: number;

  @ApiPropertyOptional({
    description: 'Expiration date of the coupon',
    example: '2024-12-31T23:59:59Z',
  })
  @IsOptional()
  @IsDateString()
  expires_at?: string;
}
