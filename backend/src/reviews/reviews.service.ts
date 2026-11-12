import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Review } from '../database/entities/review.entity';
import { OrdersService } from '../orders/orders.service';
import { BusinessRuleViolationException } from '../common/domain/domain-exception.base';

@Injectable()
export class ReviewsService {
  constructor(
    @InjectRepository(Review)
    private readonly reviewRepo: Repository<Review>,
    private readonly ordersService: OrdersService,
  ) {}

  async createReview(
    userId: string,
    productId: string,
    rating: number,
    comment: string,
  ) {
    if (rating < 1 || rating > 5) {
      throw new BusinessRuleViolationException(
        'Rating must be between 1 and 5',
      );
    }

    const existing = await this.reviewRepo.findOne({
      where: { user_id: userId, product_id: productId },
    });

    if (existing) {
      throw new BusinessRuleViolationException(
        'You have already reviewed this product.',
      );
    }

    const hasPurchased = await this.ordersService.hasUserPurchasedProduct(
      userId,
      productId,
    );

    if (!hasPurchased) {
      throw new BusinessRuleViolationException(
        'You can only review products you have purchased.',
      );
    }

    const review = this.reviewRepo.create({
      user_id: userId,
      product_id: productId,
      rating,
      comment,
      is_verified_purchase: true,
      status: 'PENDING_MODERATION',
    });

    return this.reviewRepo.save(review);
  }

  async approveReview(reviewId: string) {
    const review = await this.reviewRepo.findOne({ where: { id: reviewId } });
    if (!review) {
      throw new BusinessRuleViolationException('Review not found');
    }

    review.status = 'APPROVED';
    return this.reviewRepo.save(review);
  }
}
