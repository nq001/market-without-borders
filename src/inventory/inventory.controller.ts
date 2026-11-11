import {
  Controller,
  Get,
  Patch,
  Body,
  Param,
  ParseUUIDPipe,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { InventoryService } from './inventory.service';
import { AdjustInventoryDto } from './dto/adjust-inventory.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { Permissions } from '../auth/decorators/permissions.decorator';

@ApiTags('inventory')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('inventory')
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  @ApiOperation({ summary: 'Adjust inventory for a product' })
  @ApiParam({
    name: 'productId',
    description: 'The UUID of the product',
    format: 'uuid',
  })
  @ApiResponse({ status: 200, description: 'Inventory successfully adjusted.' })
  @ApiResponse({
    status: 400,
    description: 'Validation failed or insufficient stock.',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - requires ADJUST_INVENTORY permission.',
  })
  @ApiResponse({ status: 404, description: 'Product not found.' })
  @Permissions('ADJUST_INVENTORY')
  @Patch(':productId/adjust')
  adjustInventory(
    @Param('productId', ParseUUIDPipe) productId: string,
    @Body() dto: AdjustInventoryDto,
  ) {
    return this.inventoryService.adjustInventory(productId, dto);
  }

  @ApiOperation({ summary: 'Get inventory movements for a product' })
  @ApiParam({
    name: 'productId',
    description: 'The UUID of the product',
    format: 'uuid',
  })
  @ApiResponse({
    status: 200,
    description: 'Returns a list of inventory movements.',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - requires VIEW_INVENTORY permission.',
  })
  @Permissions('VIEW_INVENTORY')
  @Get(':productId/movements')
  getMovements(@Param('productId', ParseUUIDPipe) productId: string) {
    return this.inventoryService.getMovements(productId);
  }
}
