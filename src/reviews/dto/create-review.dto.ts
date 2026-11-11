import {
  IsInt,
  IsNotEmpty,
  IsString,
  IsUUID,
  Max,
  MaxLength,
  Min,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateReviewDto {
  @ApiProperty({
    description: 'The UUID of the product being reviewed',
    format: 'uuid',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  product_id: string;

  @ApiProperty({
    description: 'Star rating between 1 and 5',
    minimum: 1,
    maximum: 5,
    example: 5,
  })
  @IsInt()
  @Min(1)
  @Max(5)
  rating: number;

  @ApiProperty({
    description: 'Review comment text',
    example: 'Great product, highly recommend!',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(2000)
  comment: string;
}

