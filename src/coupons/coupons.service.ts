import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { Coupon } from '../database/entities/coupon.entity';
import { CreateCouponDto } from './dto/create-coupon.dto';
import { UpdateCouponDto } from './dto/update-coupon.dto';
import {
  BusinessRuleViolationException,
  ConflictDomainException,
  EntityNotFoundDomainException,
} from '../common/domain/domain-exception.base';
import { ICouponPort } from './application/ports/coupon.port';

@Injectable()
export class CouponsService implements ICouponPort {
  constructor(
    @InjectRepository(Coupon)
    private readonly couponRepository: Repository<Coupon>,
  ) {}

  async create(createCouponDto: CreateCouponDto): Promise<Coupon> {
    if (
      createCouponDto.discount_type === 'PERCENTAGE' &&
      createCouponDto.discount_amount > 100
    ) {
      throw new BusinessRuleViolationException(
        'Percentage discount cannot exceed 100%',
      );
    }

    const existing = await this.couponRepository.findOne({
      where: { code: createCouponDto.code },
    });
    if (existing) {
      throw new ConflictDomainException('Coupon code already exists');
    }

    const coupon = this.couponRepository.create(createCouponDto);
    return this.couponRepository.save(coupon);
  }

  async findAll(): Promise<Coupon[]> {
    return this.couponRepository.find();
  }

  async findOne(id: string): Promise<Coupon> {
    const coupon = await this.couponRepository.findOne({ where: { id } });
    if (!coupon) {
      throw new EntityNotFoundDomainException(
        `Coupon with ID "${id}" not found`,
      );
    }
    return coupon;
  }

  async findByCode(code: string): Promise<Coupon> {
    const coupon = await this.couponRepository.findOne({ where: { code } });
    if (!coupon) {
      throw new EntityNotFoundDomainException(
        `Coupon with code "${code}" not found`,
      );
    }
    return coupon;
  }

  async redeemCoupon(couponId: string, manager?: EntityManager): Promise<void> {
    const repo = manager
      ? manager.getRepository(Coupon)
      : this.couponRepository;
    const coupon = await repo.findOne({ where: { id: couponId } });
    if (!coupon) {
      throw new EntityNotFoundDomainException(
        `Coupon with ID "${couponId}" not found`,
      );
    }

    if (typeof coupon.incrementUsage === 'function') {
      coupon.incrementUsage();
    } else {
      if (coupon.expires_at && new Date() > new Date(coupon.expires_at)) {
        throw new BusinessRuleViolationException('Coupon is expired');
      }
      if (coupon.usage_limit && coupon.times_used >= coupon.usage_limit) {
        throw new BusinessRuleViolationException('Coupon usage limit reached');
      }
      coupon.times_used = (coupon.times_used || 0) + 1;
    }

    await repo.save(coupon);
  }

  async update(id: string, updateCouponDto: UpdateCouponDto): Promise<Coupon> {
    const coupon = await this.findOne(id);

    if (updateCouponDto.code && updateCouponDto.code !== coupon.code) {
      const existing = await this.couponRepository.findOne({
        where: { code: updateCouponDto.code },
      });
      if (existing) {
        throw new ConflictDomainException('Coupon code already exists');
      }
    }

    const nextType = updateCouponDto.discount_type ?? coupon.discount_type;
    const nextAmount =
      updateCouponDto.discount_amount ?? coupon.discount_amount;
    if (nextType === 'PERCENTAGE' && nextAmount > 100) {
      throw new BusinessRuleViolationException(
        'Percentage discount cannot exceed 100%',
      );
    }

    Object.assign(coupon, updateCouponDto);
    return this.couponRepository.save(coupon);
  }

  async remove(id: string): Promise<void> {
    const coupon = await this.findOne(id);
    await this.couponRepository.remove(coupon);
  }
}
