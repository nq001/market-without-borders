import { Test, TestingModule } from '@nestjs/testing';
import { CartController } from './cart.controller';
import { CartService } from './cart.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

describe('CartController', () => {
  let controller: CartController;
  let cartService: {
    getCartAndPricing: jest.Mock;
    addItem: jest.Mock;
    updateItemQuantity: jest.Mock;
    removeItem: jest.Mock;
    applyCoupon: jest.Mock;
    removeCoupon: jest.Mock;
  };

  beforeEach(async () => {
    cartService = {
      getCartAndPricing: jest.fn(),
      addItem: jest.fn(),
      updateItemQuantity: jest.fn(),
      removeItem: jest.fn(),
      applyCoupon: jest.fn(),
      removeCoupon: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [CartController],
      providers: [
        {
          provide: CartService,
          useValue: cartService,
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<CartController>(CartController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('passes authenticated userId to CartService.getCartAndPricing', async () => {
    cartService.getCartAndPricing.mockResolvedValue({
      cart: { id: 'cart-1', cartItems: [] },
      pricing: { subtotal: 0, discount: 0, total: 0 },
    });

    const result = await controller.getCart('user-uuid-1');
    expect(cartService.getCartAndPricing).toHaveBeenCalledWith('user-uuid-1');
    expect(result.pricing.total).toBe(0);
  });
});
