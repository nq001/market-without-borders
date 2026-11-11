import {
  Controller,
  Patch,
  Param,
  Body,
  ParseUUIDPipe,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiBody,
} from '@nestjs/swagger';
import { ShippingService } from './shipping.service';
import { DispatchShipmentDto } from './dto/dispatch-shipment.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { Permissions } from '../auth/decorators/permissions.decorator';
import { BusinessRuleViolationException } from '../common/domain/domain-exception.base';

@ApiTags('shipping')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Permissions('MANAGE_SHIPPING')
@Controller('shipping')
export class ShippingController {
  constructor(private readonly shippingService: ShippingService) {}

  @ApiOperation({ summary: 'Dispatch a shipment (Admin/Staff)' })
  @ApiParam({
    name: 'id',
    description: 'The UUID of the shipment',
    format: 'uuid',
  })
  @ApiBody({ type: DispatchShipmentDto })
  @ApiResponse({
    status: 200,
    description: 'Shipment dispatched successfully.',
  })
  @ApiResponse({
    status: 400,
    description: 'Validation failed or shipment already dispatched.',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - requires MANAGE_SHIPPING permission.',
  })
  @ApiResponse({ status: 404, description: 'Shipment not found.' })
  @Patch(':id/dispatch')
  dispatchShipment(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: DispatchShipmentDto,
  ) {
    const trackingNumber = dto.tracking_number ?? dto.trackingNumber;
    const provider = dto.provider ?? dto.carrier;
    if (!trackingNumber || !provider) {
      throw new BusinessRuleViolationException(
        'tracking_number and provider are required',
      );
    }
    return this.shippingService.dispatchShipment(id, trackingNumber, provider);
  }

  @ApiOperation({ summary: 'Mark a shipment as delivered (Admin/Staff)' })
  @ApiParam({
    name: 'id',
    description: 'The UUID of the shipment',
    format: 'uuid',
  })
  @ApiResponse({ status: 200, description: 'Shipment marked as delivered.' })
  @ApiResponse({ status: 400, description: 'Shipment not in a valid state.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - requires MANAGE_SHIPPING permission.',
  })
  @ApiResponse({ status: 404, description: 'Shipment not found.' })
  @Patch(':id/deliver')
  markDelivered(@Param('id', ParseUUIDPipe) id: string) {
    return this.shippingService.markDelivered(id);
  }
}
