import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from './../src/app.module';
import { DataSource } from 'typeorm';
import { Order } from '../src/database/entities/order.entity';
import { User } from '../src/database/entities/user.entity';
import { Shipment } from '../src/database/entities/shipment.entity';
import { PaymentEvent } from '../src/database/entities/payment-event.entity';
import { JwtService } from '@nestjs/jwt';
import { MockProviderService } from '../src/payments/mock-provider.service';

const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));

describe('Payments & Shipping (e2e)', () => {
  let app: INestApplication;
  let dataSource: DataSource;
  let jwtService: JwtService;
  let mockProvider: MockProviderService;

  let testUser: User;
  let testOrder: Order;
  let adminToken: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    dataSource = app.get(DataSource);
    jwtService = app.get(JwtService);
    mockProvider = app.get(MockProviderService);

    testUser = dataSource.getRepository(User).create({
      email: `admin_${Date.now()}@test.com`,
      password_hash: 'hash',
      first_name: 'Admin',
      last_name: 'User',
    });
    await dataSource.getRepository(User).save(testUser);

    adminToken = jwtService.sign({
      sub: testUser.id,
      id: testUser.id,
      email: testUser.email,
      roles: ['ADMIN'],
    });

    testOrder = dataSource.getRepository(Order).create({
      user_id: testUser.id,
      status: 'PENDING_PAYMENT',
      total_amount: 1000,
      subtotal_amount: 1000,
      discount_amount: 0,
    });
    await dataSource.getRepository(Order).save(testOrder);
  });

  afterAll(async () => {
    await app.close();
  });

  it('should handle successful payment webhook and create shipment', async () => {
    const payload = mockProvider.simulateWebhookPayload(
      testOrder.id,
      'success',
    );

    // 1. Send Webhook
    await request(app.getHttpServer())
      .post('/payments/webhook')
      .send(payload)
      .expect(200);

    // Give EventEmitter time to process async event
    await delay(100);

    // 2. Verify Order is PAID
    const order = await dataSource.getRepository(Order).findOne({
      where: { id: testOrder.id },
    });
    expect(order?.status).toBe('PAID');

    // 3. Verify PaymentEvent is recorded
    const event = await dataSource.getRepository(PaymentEvent).findOne({
      where: { provider_event_id: payload.event_id },
    });
    expect(event).toBeDefined();
    expect(event?.internal_status).toBe('PROCESSED');

    // 4. Verify Shipment is created in PENDING state
    const shipment = await dataSource.getRepository(Shipment).findOne({
      where: { order_id: testOrder.id },
    });
    expect(shipment).toBeDefined();
    expect(shipment?.status).toBe('PENDING');
  });

  it('should ignore duplicate webhooks without throwing 500 error', async () => {
    // Generate a payload and send it twice
    const payload = mockProvider.simulateWebhookPayload(
      testOrder.id,
      'success',
    );

    await request(app.getHttpServer())
      .post('/payments/webhook')
      .send(payload)
      .expect(200);

    // Send the exact same payload again
    const res = await request(app.getHttpServer())
      .post('/payments/webhook')
      .send(payload)
      .expect(200);

    // Verify it was ignored successfully
    expect(res.body.received).toBe(true);

    // Verify only one event exists in DB
    const events = await dataSource.getRepository(PaymentEvent).find({
      where: { provider_event_id: payload.event_id },
    });
    expect(events.length).toBe(1);
  });

  it('should transition shipping states correctly (Admin)', async () => {
    const shipment = await dataSource.getRepository(Shipment).findOne({
      where: { order_id: testOrder.id },
    });

    // Dispatch
    await request(app.getHttpServer())
      .patch(`/shipping/${shipment!.id}/dispatch`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ tracking_number: 'TRACK123', provider: 'FedEx' })
      .expect(200);

    let updatedShipment = await dataSource.getRepository(Shipment).findOne({
      where: { id: shipment!.id },
    });
    expect(updatedShipment?.status).toBe('SHIPPED');
    expect(updatedShipment?.tracking_number).toBe('TRACK123');

    // Deliver
    await request(app.getHttpServer())
      .patch(`/shipping/${shipment!.id}/deliver`)
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200);

    updatedShipment = await dataSource.getRepository(Shipment).findOne({
      where: { id: shipment!.id },
    });
    expect(updatedShipment?.status).toBe('DELIVERED');
  });
});
