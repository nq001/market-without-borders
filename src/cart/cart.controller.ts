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
  ApiBody,
} from '@nestjs/swagger';
import { CartService } from './cart.service';
import { AddCartItemDto } from './dto/add-cart-item.dto';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';
import { ApplyCouponDto } from './dto/apply-coupon.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@ApiTags('cart')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('cart')
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @ApiOperation({ summary: 'Retrieve the current user cart' })
  @ApiResponse({
    status: 200,
    description: 'Returns the cart and computed pricing.',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @Get()
  getCart(@CurrentUser('sub') userId: string) {
    return this.cartService.getCartAndPricing(userId);
  }

  @ApiOperation({ summary: 'Add an item to the cart' })
  @ApiResponse({ status: 201, description: 'Item added to cart successfully.' })
  @ApiResponse({
    status: 400,
    description: 'Validation failed or insufficient inventory.',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 404, description: 'Product not found.' })
  @Post('items')
  addItem(@CurrentUser('sub') userId: string, @Body() dto: AddCartItemDto) {
    return this.cartService.addItem(userId, dto);
  }

  @ApiOperation({ summary: 'Update the quantity of a cart item' })
  @ApiParam({
    name: 'productId',
    description: 'The UUID of the product in the cart',
    format: 'uuid',
  })
  @ApiBody({ type: UpdateCartItemDto })
  @ApiResponse({ status: 200, description: 'Quantity updated successfully.' })
  @ApiResponse({
    status: 400,
    description: 'Validation failed or insufficient inventory.',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 404, description: 'Product not in cart.' })
  @Patch('items/:productId')
  updateItemQuantity(
    @CurrentUser('sub') userId: string,
    @Param('productId', ParseUUIDPipe) productId: string,
    @Body() dto: UpdateCartItemDto,
  ) {
    return this.cartService.updateItemQuantity(userId, productId, dto.quantity);
  }

  @ApiOperation({ summary: 'Remove an item from the cart' })
  @ApiParam({
    name: 'productId',
    description: 'The UUID of the product to remove',
    format: 'uuid',
  })
  @ApiResponse({ status: 200, description: 'Item removed from cart.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 404, description: 'Product not in cart.' })
  @Delete('items/:productId')
  removeItem(
    @CurrentUser('sub') userId: string,
    @Param('productId', ParseUUIDPipe) productId: string,
  ) {
    return this.cartService.removeItem(userId, productId);
  }

  @ApiOperation({ summary: 'Apply a discount coupon to the cart' })
  @ApiResponse({ status: 201, description: 'Coupon applied successfully.' })
  @ApiResponse({
    status: 400,
    description: 'Coupon invalid, expired, or usage limit reached.',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @Post('coupon')
  applyCoupon(@CurrentUser('sub') userId: string, @Body() dto: ApplyCouponDto) {
    return this.cartService.applyCoupon(userId, dto);
  }

  @ApiOperation({
    summary: 'Remove the currently applied coupon from the cart',
  })
  @ApiResponse({ status: 200, description: 'Coupon removed successfully.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @Delete('coupon')
  removeCoupon(@CurrentUser('sub') userId: string) {
    return this.cartService.removeCoupon(userId);
  }
}
