import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
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
import { CouponsService } from './coupons.service';
import { CreateCouponDto } from './dto/create-coupon.dto';
import { UpdateCouponDto } from './dto/update-coupon.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { Permissions } from '../auth/decorators/permissions.decorator';

@ApiTags('coupons')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('coupons')
export class CouponsController {
  constructor(private readonly couponsService: CouponsService) {}

  @ApiOperation({ summary: 'Create a new coupon' })
  @ApiResponse({
    status: 201,
    description: 'The coupon has been successfully created.',
  })
  @ApiResponse({ status: 400, description: 'Validation failed.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - requires CREATE_COUPON permission.',
  })
  @Permissions('CREATE_COUPON')
  @Post()
  create(@Body() createCouponDto: CreateCouponDto) {
    return this.couponsService.create(createCouponDto);
  }

  @ApiOperation({ summary: 'Retrieve all coupons' })
  @ApiResponse({ status: 200, description: 'Returns a list of coupons.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - requires VIEW_COUPON permission.',
  })
  @Permissions('VIEW_COUPON')
  @Get()
  findAll() {
    return this.couponsService.findAll();
  }

  @ApiOperation({ summary: 'Retrieve a single coupon by ID' })
  @ApiParam({
    name: 'id',
    description: 'The UUID of the coupon',
    format: 'uuid',
  })
  @ApiResponse({ status: 200, description: 'Returns the coupon details.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - requires VIEW_COUPON permission.',
  })
  @ApiResponse({ status: 404, description: 'Coupon not found.' })
  @Permissions('VIEW_COUPON')
  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.couponsService.findOne(id);
  }

  @ApiOperation({ summary: 'Update a coupon' })
  @ApiParam({
    name: 'id',
    description: 'The UUID of the coupon',
    format: 'uuid',
  })
  @ApiResponse({
    status: 200,
    description: 'The coupon has been successfully updated.',
  })
  @ApiResponse({ status: 400, description: 'Validation failed.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - requires UPDATE_COUPON permission.',
  })
  @ApiResponse({ status: 404, description: 'Coupon not found.' })
  @Permissions('UPDATE_COUPON')
  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateCouponDto: UpdateCouponDto,
  ) {
    return this.couponsService.update(id, updateCouponDto);
  }

  @ApiOperation({ summary: 'Delete a coupon' })
  @ApiParam({
    name: 'id',
    description: 'The UUID of the coupon',
    format: 'uuid',
  })
  @ApiResponse({
    status: 200,
    description: 'The coupon has been successfully deleted.',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - requires DELETE_COUPON permission.',
  })
  @ApiResponse({ status: 404, description: 'Coupon not found.' })
  @Permissions('DELETE_COUPON')
  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.couponsService.remove(id);
  }
}
