import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { AppModule } from './../src/app.module';
import { DataSource } from 'typeorm';
import { PaymentEvent } from '../src/database/entities/payment-event.entity';
import { User } from '../src/database/entities/user.entity';
import { Order, OrderStatus } from '../src/database/entities/order.entity';
import { v4 as uuidv4 } from 'uuid';

describe('Database Constraints & Transactions (Integration)', () => {
  let app: INestApplication;
  let dataSource: DataSource;
  let testUser: User;
  let testOrder: Order;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    dataSource = app.get(DataSource);

    testUser = dataSource.getRepository(User).create({
      email: `db_constraints_${Date.now()}@test.com`,
      password_hash: 'hash',
      first_name: 'DB',
      last_name: 'Constraint',
    });
    await dataSource.getRepository(User).save(testUser);

    testOrder = dataSource.getRepository(Order).create({
      user_id: testUser.id,
      status: OrderStatus.PENDING_PAYMENT,
      total_amount: 100,
      subtotal_amount: 100,
      discount_amount: 0,
    });
    await dataSource.getRepository(Order).save(testOrder);
  });

  afterAll(async () => {
    await app.close();
  });

  it('should enforce unique provider_event_id on payment events', async () => {
    const eventId = uuidv4();
    const orderId = testOrder.id;

    const repo = dataSource.getRepository(PaymentEvent);

    // First insert should succeed
    const event1 = repo.create({
      provider_event_id: eventId,
      order_id: orderId,
      provider_status: 'success',
      internal_status: 'PROCESSED',
      amount: 100,
    });
    await expect(repo.save(event1)).resolves.toBeDefined();

    // Second insert with same provider_event_id should throw unique constraint violation
    const event2 = repo.create({
      provider_event_id: eventId,
      order_id: orderId,
      provider_status: 'success',
      internal_status: 'PROCESSED',
      amount: 100,
    });
    await expect(repo.save(event2)).rejects.toThrow();
  });

  it('should rollback transaction on error', async () => {
    const repo = dataSource.getRepository(PaymentEvent);
    const eventId = uuidv4();
    const orderId = testOrder.id;

    try {
      await dataSource.transaction(async (manager) => {
        const event = manager.create(PaymentEvent, {
          provider_event_id: eventId,
          order_id: orderId,
          provider_status: 'success',
          internal_status: 'PROCESSING',
          amount: 100,
        });
        await manager.save(event);

        // Throw error intentionally
        throw new Error('Intentional failure');
      });
    } catch (e) {
      // expected
    }

    // Verify it was rolled back
    const found = await repo.findOne({ where: { provider_event_id: eventId } });
    expect(found).toBeNull();
  });
});
