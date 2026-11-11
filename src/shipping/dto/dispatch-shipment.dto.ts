import { IsOptional, IsString, MaxLength } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class DispatchShipmentDto {
  @ApiPropertyOptional({ example: '1Z9999999999999999' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  tracking_number?: string;

  @ApiPropertyOptional({ example: '1Z9999999999999999' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  trackingNumber?: string;

  @ApiPropertyOptional({ example: 'UPS' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  provider?: string;

  @ApiPropertyOptional({ example: 'UPS' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  carrier?: string;
}

