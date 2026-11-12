import { IsInt, IsEnum, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { InventoryMovementType } from '../../database/entities/inventory-movement.entity';

export class AdjustInventoryDto {
  @ApiProperty({
    description:
      'The quantity to adjust (can be positive or negative based on movement type)',
    example: 10,
  })
  @IsInt()
  quantity: number;

  @ApiProperty({
    description: 'The type of inventory movement',
    enum: InventoryMovementType,
    example: InventoryMovementType.ADD,
  })
  @IsEnum(InventoryMovementType)
  type: InventoryMovementType;

  @ApiPropertyOptional({
    description:
      'Optional reference ID (e.g., Order ID, PO ID) associated with this movement',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsOptional()
  @IsString()
  reference_id?: string;
}
