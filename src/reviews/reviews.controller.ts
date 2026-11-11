import {
  Controller,
  Post,
  Body,
  UseGuards,
  Patch,
  Param,
  ParseUUIDPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiBody,
} from '@nestjs/swagger';
import { ReviewsService } from './reviews.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { Permissions } from '../auth/decorators/permissions.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@ApiTags('reviews')
@ApiBearerAuth()
@Controller('reviews')
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @ApiOperation({ summary: 'Create a product review' })
  @ApiBody({ type: CreateReviewDto })
  @ApiResponse({
    status: 201,
    description: 'Review successfully created (pending approval).',
  })
  @ApiResponse({ status: 400, description: 'Validation failed.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 404, description: 'Product not found.' })
  @UseGuards(JwtAuthGuard)
  @Post()
  createReview(
    @CurrentUser('sub') userId: string,
    @Body() body: CreateReviewDto,
  ) {
    return this.reviewsService.createReview(
      userId,
      body.product_id,
      body.rating,
      body.comment,
    );
  }

  @ApiOperation({ summary: 'Approve a pending review (Admin only)' })
  @ApiParam({
    name: 'id',
    description: 'The UUID of the review',
    format: 'uuid',
  })
  @ApiResponse({ status: 200, description: 'Review successfully approved.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - requires APPROVE_REVIEW permission.',
  })
  @ApiResponse({ status: 404, description: 'Review not found.' })
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions('APPROVE_REVIEW')
  @Patch(':id/approve')
  approveReview(@Param('id', ParseUUIDPipe) id: string) {
    return this.reviewsService.approveReview(id);
  }
}
