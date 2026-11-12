import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { CartService } from './cart.service';
import { PricingService } from './pricing.service';
import { Cart } from '../database/entities/cart.entity';
import { CartItem } from '../database/entities/cart-item.entity';
import { ProductsService } from '../catalog/products/products.service';
import { CouponsService } from '../coupons/coupons.service';

describe('CartService', () => {
  let service: CartService;
  let cartRepo: {
    findOne: jest.Mock;
    create: jest.Mock;
    save: jest.Mock;
  };
  let cartItemRepo: {
    findOne: jest.Mock;
    create: jest.Mock;
    save: jest.Mock;
    remove: jest.Mock;
  };
  let productsService: {
    findActiveById: jest.Mock;
  };
  let couponsService: {
    findByCode: jest.Mock;
  };

  beforeEach(async () => {
    cartRepo = {
      findOne: jest.fn(),
      create: jest.fn((dto) => ({ id: 'cart-1', cartItems: [], ...dto })),
      save: jest.fn((c) => Promise.resolve(c)),
    };

    cartItemRepo = {
      findOne: jest.fn(),
      create: jest.fn((dto) => ({ id: 'item-1', ...dto })),
      save: jest.fn((item) => Promise.resolve(item)),
      remove: jest.fn(() => Promise.resolve()),
    };

    productsService = {
      findActiveById: jest.fn(),
    };

    couponsService = {
      findByCode: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CartService,
        PricingService,
        {
          provide: getRepositoryToken(Cart),
          useValue: cartRepo,
        },
        {
          provide: getRepositoryToken(CartItem),
          useValue: cartItemRepo,
        },
        {
          provide: ProductsService,
          useValue: productsService,
        },
        {
          provide: CouponsService,
          useValue: couponsService,
        },
      ],
    }).compile();

    service = module.get<CartService>(CartService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('creates a new cart when user does not have one and returns pricing', async () => {
    cartRepo.findOne.mockResolvedValue(null);

    const res = await service.getCartAndPricing('user-1');
    expect(cartRepo.create).toHaveBeenCalledWith({ user_id: 'user-1' });
    expect(res.pricing).toEqual({ subtotal: 0, discount: 0, total: 0 });
  });
});
