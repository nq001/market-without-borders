import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsInt,
  IsUUID,
  IsBoolean,
  Min,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateProductDto {
  @ApiProperty({
    description: 'Unique Stock Keeping Unit identifier for the product',
    example: 'PROD-ELEC-001',
  })
  @IsString()
  @IsNotEmpty()
  sku: string;

  @ApiProperty({
    description: 'The name of the product',
    example: 'Wireless Headphones',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional({
    description: 'Detailed description of the product',
    example: 'High quality noise-canceling wireless headphones.',
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({
    description: 'Price of the product in cents (e.g., 1000 = $10.00)',
    example: 9999,
    minimum: 0,
  })
  @IsInt()
  @Min(0)
  price: number;

  @ApiProperty({
    description: 'The UUID of the category this product belongs to',
    example: '123e4567-e89b-12d3-a456-426614174000',
    format: 'uuid',
  })
  @IsUUID('4')
  category_id: string;

  @ApiPropertyOptional({
    description: 'Whether the product is active and visible to customers',
    example: true,
    default: true,
  })
  @IsBoolean()
  @IsOptional()
  is_active?: boolean;
}
