import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { AppModule } from './../src/app.module';
import { DataSource } from 'typeorm';
import { OrdersService } from '../src/orders/orders.service';
import { IdempotencyKey } from '../src/database/entities/idempotency-key.entity';
import { v4 as uuidv4 } from 'uuid';
import { ConflictException } from '@nestjs/common';

describe('Failure Modes & Boundary Testing', () => {
  let app: INestApplication;
  let dataSource: DataSource;
  let ordersService: OrdersService;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    dataSource = app.get(DataSource);
    ordersService = app.get(OrdersService);
  });

  afterAll(async () => {
    await dataSource.destroy();
    await app.close();
  });

  describe('Idempotency & Concurrency', () => {
    it('should reject duplicate idempotency keys globally', async () => {
      const key = uuidv4();

      const keyRepo = dataSource.getRepository(IdempotencyKey);

      // Save manually
      await keyRepo.save(keyRepo.create({ key }));

      // Simulate checkout which creates a key
      await expect(
        ordersService.checkout(uuidv4(), { idempotency_key: key }),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('Provider Failures', () => {
    it('should rollback and delete idempotency key if provider or internal validation throws', async () => {
      const key = uuidv4();
      const userId = uuidv4(); // User doesn't exist, will throw inside checkout.

      // Since userId doesn't exist, getCartAndPricing will fail, and error will bubble up.
      await expect(
        ordersService.checkout(userId, { idempotency_key: key }),
      ).rejects.toThrow();

      // Ensure key is released so user can retry safely
      const keyRepo = dataSource.getRepository(IdempotencyKey);
      const found = await keyRepo.findOne({ where: { key } });
      expect(found).toBeNull(); // Cleaned up
    });
  });
});
