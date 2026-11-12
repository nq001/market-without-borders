import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ApplyCouponDto {
  @ApiProperty({
    description: 'The discount code to apply',
    example: 'SUMMER2024',
  })
  @IsString()
  @IsNotEmpty()
  code: string;
}
