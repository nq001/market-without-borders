import { Controller, Post, Body, Req, UseGuards } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { OrdersService } from './orders.service';
import { CheckoutDto } from './dto/checkout.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { Request } from 'express';

@ApiTags('orders')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @ApiOperation({ summary: 'Process checkout and place an order' })
  @ApiResponse({ status: 201, description: 'Order successfully placed.' })
  @ApiResponse({
    status: 400,
    description: 'Validation failed, empty cart, or insufficient stock.',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({
    status: 409,
    description: 'Idempotency key conflict (order already processing).',
  })
  @Post('checkout')
  checkout(
    @CurrentUser('sub') userId: string,
    @Body() dto: CheckoutDto,
    @Req() req?: Request,
  ) {
    return this.ordersService.checkout(userId, dto, req?.path ?? '');
  }
}
