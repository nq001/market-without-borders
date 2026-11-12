import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ConflictException } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { IdempotencyKey } from '../database/entities/idempotency-key.entity';
import { CartService } from '../cart/cart.service';
import { InventoryService } from '../inventory/inventory.service';
import { DataSource } from 'typeorm';

describe('OrdersService', () => {
  let service: OrdersService;
  let idempotencyRepo: any;
  let cartService: any;
  let inventoryService: any;
  let dataSource: any;

  beforeEach(async () => {
    idempotencyRepo = {
      findOne: jest.fn(),
      create: jest.fn((entity) => ({ ...entity })),
      save: jest.fn((entity) => Promise.resolve({ ...entity })),
      remove: jest.fn(() => Promise.resolve()),
    };

    cartService = {
      getCartAndPricing: jest.fn().mockResolvedValue({
        cart: {
          id: 'cart-1',
          cartItems: [
            {
              product_id: 'prod-1',
              quantity: 2,
              product: { name: 'Product 1', sku: 'SKU1', price: 1000 },
            },
          ],
          coupon_id: null,
        },
        pricing: { subtotal: 2000, discount: 0, total: 2000 },
      }),
    };

    inventoryService = {
      reserveInventory: jest.fn().mockResolvedValue(undefined),
      releaseInventory: jest.fn().mockResolvedValue(undefined),
    };

    dataSource = {
      transaction: jest.fn().mockImplementation(async (callback) => {
        const mockManager = {
          create: jest.fn((_, obj) => obj),
          save: jest.fn((obj) => Promise.resolve(obj)),
          remove: jest.fn(() => Promise.resolve()),
        };
        return callback(mockManager);
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrdersService,
        {
          provide: getRepositoryToken(IdempotencyKey),
          useValue: idempotencyRepo,
        },
        {
          provide: CartService,
          useValue: cartService,
        },
        {
          provide: InventoryService,
          useValue: inventoryService,
        },
        {
          provide: DataSource,
          useValue: dataSource,
        },
      ],
    }).compile();

    service = module.get<OrdersService>(OrdersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should delete idempotency key and not release inventory when reserveInventory throws', async () => {
    const error = new ConflictException('InsufficientStockException');
    inventoryService.reserveInventory.mockRejectedValue(error);

    await expect(
      service.checkout(
        'user-1',
        {
          idempotency_key: 'idemp-fail-1',
          full_name: 'John',
          phone: '123',
          country: 'US',
          city: 'NYC',
          street: 'Main',
          postal_code: '10001',
        },
        '/orders/checkout',
      ),
    ).rejects.toThrow(ConflictException);

    // The in-progress key MUST be removed so retries are not stuck
    expect(idempotencyRepo.remove).toHaveBeenCalled();
    // Inventory was NOT reserved successfully, so releaseInventory MUST NOT be called
    expect(inventoryService.releaseInventory).not.toHaveBeenCalled();
  });

  it('should throw ConflictException when idempotency insert fails with 23505 unique violation', async () => {
    const error: any = new Error('duplicate key value violates unique constraint');
    error.code = '23505';
    idempotencyRepo.save.mockRejectedValue(error);

    await expect(
      service.checkout(
        'user-1',
        {
          idempotency_key: 'idemp-race-1',
          full_name: 'John',
          phone: '123',
          country: 'US',
          city: 'NYC',
          street: 'Main',
          postal_code: '10001',
        },
        '/orders/checkout',
      ),
    ).rejects.toThrow(ConflictException);

    await expect(
      service.checkout(
        'user-1',
        {
          idempotency_key: 'idemp-race-1',
          full_name: 'John',
          phone: '123',
          country: 'US',
          city: 'NYC',
          street: 'Main',
          postal_code: '10001',
        },
        '/orders/checkout',
      ),
    ).rejects.toThrow('Request with this idempotency key is already in progress');

    expect(inventoryService.reserveInventory).not.toHaveBeenCalled();
  });

  it('should release inventory and delete idempotency key if transaction fails after reservation', async () => {
    dataSource.transaction.mockRejectedValue(new Error('DB failure'));

    await expect(
      service.checkout(
        'user-1',
        {
          idempotency_key: 'idemp-tx-fail',
          full_name: 'John',
          phone: '123',
          country: 'US',
          city: 'NYC',
          street: 'Main',
          postal_code: '10001',
        },
        '/orders/checkout',
      ),
    ).rejects.toThrow('DB failure');

    // Reservation succeeded, so release must be called
    expect(inventoryService.releaseInventory).toHaveBeenCalled();
    // Idempotency key must be removed
    expect(idempotencyRepo.remove).toHaveBeenCalled();
  });
});
