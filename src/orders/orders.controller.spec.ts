import { Test, TestingModule } from '@nestjs/testing';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

describe('OrdersController', () => {
  let controller: OrdersController;
  let ordersService: {
    checkout: jest.Mock;
  };

  beforeEach(async () => {
    ordersService = {
      checkout: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [OrdersController],
      providers: [
        {
          provide: OrdersService,
          useValue: ordersService,
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<OrdersController>(OrdersController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('delegates checkout to OrdersService', async () => {
    ordersService.checkout.mockResolvedValue({
      id: 'ord-1',
      status: 'PENDING_PAYMENT',
    });

    const dto = {
      idempotency_key: 'idemp-1',
      full_name: 'Jane Doe',
      phone: '555-0100',
      country: 'US',
      city: 'Austin',
      street: '100 Congress Ave',
      postal_code: '78701',
    };

    const res = await controller.checkout('user-1', dto);
    expect(ordersService.checkout).toHaveBeenCalledWith('user-1', dto, '');
    expect(res.id).toBe('ord-1');
  });
});
