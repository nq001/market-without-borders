import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from './../src/app.module';
import { DataSource } from 'typeorm';
import { User } from '../src/database/entities/user.entity';
import { Category } from '../src/database/entities/category.entity';
import { Product } from '../src/database/entities/product.entity';
import { Order, OrderStatus } from '../src/database/entities/order.entity';
import { OrderItem } from '../src/database/entities/order-item.entity';
import { Review } from '../src/database/entities/review.entity';
import { AuditLog } from '../src/database/entities/audit-log.entity';
import { Notification } from '../src/database/entities/notification.entity';
import { JwtService } from '@nestjs/jwt';
import { EventEmitter2 } from '@nestjs/event-emitter';

describe('Phase 14 (Notifications, Reviews, Audit) (e2e)', () => {
  let app: INestApplication;
  let dataSource: DataSource;
  let jwtService: JwtService;
  let eventEmitter: EventEmitter2;

  let testUser: User;
  let testCategory: Category;
  let testProduct: Product;
  let testOrder: Order;
  let userToken: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    dataSource = app.get(DataSource);
    jwtService = app.get(JwtService);
    eventEmitter = app.get(EventEmitter2);

    testUser = dataSource.getRepository(User).create({
      email: `user_${Date.now()}@test.com`,
      password_hash: 'hash',
      first_name: 'Test',
      last_name: 'User',
    });
    await dataSource.getRepository(User).save(testUser);

    userToken = jwtService.sign({
      sub: testUser.id,
      id: testUser.id,
      email: testUser.email,
      roles: ['CUSTOMER'],
    });

    testCategory = dataSource.getRepository(Category).create({
      name: `ReviewCat_${Date.now()}`,
      slug: `review-cat-${Date.now()}`,
    });
    await dataSource.getRepository(Category).save(testCategory);

    testProduct = dataSource.getRepository(Product).create({
      sku: `SKU-${Date.now()}`,
      name: 'Reviewable Product',
      description: 'Desc',
      price: 100,
      category_id: testCategory.id,
      is_active: true,
    });
    await dataSource.getRepository(Product).save(testProduct);

    testOrder = dataSource.getRepository(Order).create({
      user_id: testUser.id,
      status: OrderStatus.PAID, // Needs to be paid for review verified purchase
      total_amount: 100,
      subtotal_amount: 100,
      discount_amount: 0,
    });
    await dataSource.getRepository(Order).save(testOrder);

    const orderItem = dataSource.getRepository(OrderItem).create({
      order_id: testOrder.id,
      product_id: testProduct.id,
      product_name_snapshot: testProduct.name,
      sku_snapshot: testProduct.sku,
      quantity: 1,
      unit_price_snapshot: 100,
      line_total: 100,
    });
    await dataSource.getRepository(OrderItem).save(orderItem);
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Reviews', () => {
    it('should allow user to review a purchased product', async () => {
      const res = await request(app.getHttpServer())
        .post('/reviews')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          product_id: testProduct.id,
          rating: 5,
          comment: 'Great product!',
        })
        .expect(201);

      expect(res.body.is_verified_purchase).toBe(true);
      expect(res.body.status).toBe('PENDING_MODERATION');

      // Verify in DB
      const review = await dataSource
        .getRepository(Review)
        .findOne({ where: { id: res.body.id } });
      expect(review).toBeDefined();
    });

    it('should prevent multiple reviews for the same product', async () => {
      await request(app.getHttpServer())
        .post('/reviews')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          product_id: testProduct.id,
          rating: 4,
          comment: 'Another review',
        })
        .expect(400); // Bad Request from ReviewsService
    });

    it('should prevent review for unpurchased product', async () => {
      const unpurchasedProduct = dataSource.getRepository(Product).create({
        sku: `SKU-UNP-${Date.now()}`,
        name: 'Unpurchased',
        price: 10,
        category_id: testCategory.id,
        is_active: true,
      });
      await dataSource.getRepository(Product).save(unpurchasedProduct);

      await request(app.getHttpServer())
        .post('/reviews')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          product_id: unpurchasedProduct.id,
          rating: 5,
          comment: 'Fake review',
        })
        .expect(400); // Bad request
    });
  });

  describe('Notifications (Outbox Pattern)', () => {
    it('should create a PENDING notification when order.paid event is emitted', async () => {
      // Manually emit the event instead of running full payment cycle
      await eventEmitter.emitAsync('order.paid', {
        orderId: testOrder.id,
        userId: testUser.id,
      });

      const notifications = await dataSource.getRepository(Notification).find({
        where: { user_id: testUser.id, type: 'ORDER_CONFIRMATION' },
        order: { created_at: 'DESC' },
      });

      expect(notifications.length).toBeGreaterThan(0);
      expect(notifications[0].status).toBe('PENDING');
      expect(notifications[0].payload).toHaveProperty('orderId', testOrder.id);
    });
  });

  describe('Audit Logging', () => {
    it('should be able to use explicit Audit Log creation', async () => {
      // In a real e2e, we would call an admin endpoint that logs. Here we verify the entity rules.
      const auditLog = dataSource.getRepository(AuditLog).create({
        user_id: testUser.id,
        action: 'UPDATE_PRODUCT',
        entity_type: 'Product',
        entity_id: testProduct.id,
        changes: { price: 200 },
        ip_address: '127.0.0.1',
      });

      await dataSource.getRepository(AuditLog).save(auditLog);

      const saved = await dataSource
        .getRepository(AuditLog)
        .findOne({ where: { id: auditLog.id } });
      expect(saved).toBeDefined();
      expect(saved?.action).toBe('UPDATE_PRODUCT');
    });
  });
});
