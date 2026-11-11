import { Test, TestingModule } from '@nestjs/testing';
import { CouponsService } from './coupons.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Coupon } from '../database/entities/coupon.entity';
import { ConflictException } from '@nestjs/common';

describe('CouponsService', () => {
  let service: CouponsService;
  let repo: any;

  beforeEach(async () => {
    repo = {
      findOne: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CouponsService,
        {
          provide: getRepositoryToken(Coupon),
          useValue: repo,
        },
      ],
    }).compile();

    service = module.get<CouponsService>(CouponsService);
  });

  it('should create a coupon if code is unique', async () => {
    repo.findOne.mockResolvedValue(null);
    repo.create.mockReturnValue({ code: 'NEWCODE' });
    repo.save.mockResolvedValue({ id: '1', code: 'NEWCODE' });

    const result = await service.create({
      code: 'NEWCODE',
      discount_type: 'FIXED',
      discount_amount: 10,
    } as any);
    expect(result.code).toBe('NEWCODE');
    expect(repo.create).toHaveBeenCalled();
  });

  it('should throw ConflictException if coupon code exists on create', async () => {
    repo.findOne.mockResolvedValue({ id: '1', code: 'EXISTING' });

    await expect(
      service.create({
        code: 'EXISTING',
        discount_type: 'FIXED',
        discount_amount: 10,
      } as any),
    ).rejects.toThrow(ConflictException);
  });
});
