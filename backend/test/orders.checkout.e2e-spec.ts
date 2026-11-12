/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from './../src/app.module';
import { DataSource } from 'typeorm';
import { Category } from '../src/database/entities/category.entity';
import { Product } from '../src/database/entities/product.entity';
import { Inventory } from '../src/database/entities/inventory.entity';
import { User } from '../src/database/entities/user.entity';
import { CartItem } from '../src/database/entities/cart-item.entity';
import { JwtService } from '@nestjs/jwt';

describe('Orders & Checkout (e2e)', () => {
  let app: INestApplication;
  let dataSource: DataSource;
  let jwtService: JwtService;

  let testUser: User;
  let testCategory: Category;
  let testProduct1: Product;
  let testProduct2: Product;
  let jwtToken: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    dataSource = app.get(DataSource);
    jwtService = app.get(JwtService);

    // Seed User
    testUser = dataSource.getRepository(User).create({
      email: `checkout_${Date.now()}@test.com`,
      password_hash: 'hash',
      first_name: 'Check',
      last_name: 'Out',
    });
    await dataSource.getRepository(User).save(testUser);

    jwtToken = jwtService.sign({
      sub: testUser.id,
      id: testUser.id,
      email: testUser.email,
      roles: ['CUSTOMER'],
    });

    // Seed Category
    testCategory = dataSource.getRepository(Category).create({
      name: `Category_${Date.now()}`,
      slug: `cat_${Date.now()}`,
    });
    await dataSource.getRepository(Category).save(testCategory);

    // Seed Products
    testProduct1 = dataSource.getRepository(Product).create({
      name: 'Product 1',
      description: 'Desc 1',
      price: 1000,
      sku: `SKU1_${Date.now()}`,
      category_id: testCategory.id,
      is_active: true,
    });
    testProduct2 = dataSource.getRepository(Product).create({
      name: 'Product 2',
      description: 'Desc 2',
      price: 500,
      sku: `SKU2_${Date.now()}`,
      category_id: testCategory.id,
      is_active: true,
    });
    await dataSource.getRepository(Product).save([testProduct1, testProduct2]);

    // Seed Inventory
    await dataSource.getRepository(Inventory).save([
      {
        product_id: testProduct1.id,
        available_quantity: 5,
        reserved_quantity: 0,
      },
      {
        product_id: testProduct2.id,
        available_quantity: 1,
        reserved_quantity: 0,
      },
    ]);
  });

  afterAll(async () => {
    await app.close();
  });

  const generateIdempotencyKey = () => `idemp_${Date.now()}_${Math.random()}`;

  const checkoutPayload = {
    full_name: 'John Doe',
    phone: '123456789',
    country: 'USA',
    city: 'New York',
    street: '123 Test St',
    postal_code: '10001',
  };

  it('should fail checkout if cart is empty', async () => {
    const res = await request(app.getHttpServer())
      .post('/orders/checkout')
      .set('Authorization', `Bearer ${jwtToken}`)
      .send({ ...checkoutPayload, idempotency_key: generateIdempotencyKey() });

    expect(res.status).toBe(400);
    expect(res.body.message).toBe('Cart is empty');
  });

  it('should successfully checkout', async () => {
    // 1. Add items to cart
    await request(app.getHttpServer())
      .post('/cart/items')
      .set('Authorization', `Bearer ${jwtToken}`)
      .send({ product_id: testProduct1.id, quantity: 2 })
      .expect(201);

    const idempotencyKey = generateIdempotencyKey();

    // 2. Checkout
    const res = await request(app.getHttpServer())
      .post('/orders/checkout')
      .set('Authorization', `Bearer ${jwtToken}`)
      .send({ ...checkoutPayload, idempotency_key: idempotencyKey })
      .expect(201);

    expect(res.body.status).toBe('PENDING_PAYMENT');
    expect(res.body.subtotal_amount).toBe(2000); // 2 * 1000

    // 3. Verify Inventory reserved
    const inv1 = await dataSource
      .getRepository(Inventory)
      .findOne({ where: { product_id: testProduct1.id } });
    expect(inv1?.available_quantity).toBe(3); // 5 - 2
    expect(inv1?.reserved_quantity).toBe(2);

    // 4. Verify cart is empty
    const cartItems = await dataSource
      .getRepository(CartItem)
      .find({ where: { cart: { user_id: testUser.id } } });
    expect(cartItems.length).toBe(0);

    // 5. Verify Idempotency returns exactly same order on duplicate key
    const duplicateRes = await request(app.getHttpServer())
      .post('/orders/checkout')
      .set('Authorization', `Bearer ${jwtToken}`)
      .send({ ...checkoutPayload, idempotency_key: idempotencyKey })
      .expect(201);

    expect(duplicateRes.body.id).toBe(res.body.id); // Same order ID returned
  });

  it('should rollback transaction and release inventory if checkout fails', async () => {
    // 1. Add item that exists
    await request(app.getHttpServer())
      .post('/cart/items')
      .set('Authorization', `Bearer ${jwtToken}`)
      .send({ product_id: testProduct2.id, quantity: 5 }) // Try to buy 5, but only 1 available
      .expect(201);

    const idempotencyKey = generateIdempotencyKey();

    // 2. Checkout should fail due to insufficient stock
    const res = await request(app.getHttpServer())
      .post('/orders/checkout')
      .set('Authorization', `Bearer ${jwtToken}`)
      .send({ ...checkoutPayload, idempotency_key: idempotencyKey })
      .expect(409); // ConflictException from reserveInventory

    expect(res.body.message).toContain('InsufficientStockException');

    // 3. Ensure idempotency key is deleted on failure
    await request(app.getHttpServer())
      .post('/orders/checkout')
      .set('Authorization', `Bearer ${jwtToken}`)
      .send({ ...checkoutPayload, idempotency_key: idempotencyKey })
      .expect(409); // Same error because cart still has 5 items

    // 4. Inventory is unchanged (1 available)
    const inv2 = await dataSource
      .getRepository(Inventory)
      .findOne({ where: { product_id: testProduct2.id } });
    expect(inv2?.available_quantity).toBe(1);
    expect(inv2?.reserved_quantity).toBe(0);
  });

  it('should allow retry with same idempotency key after insufficient stock failure', async () => {
    // 0. Dedicated User A
    const userA = dataSource.getRepository(User).create({
      email: `usera_${Date.now()}@test.com`,
      password_hash: 'hash',
      first_name: 'User',
      last_name: 'A',
    });
    await dataSource.getRepository(User).save(userA);
    const tokenA = jwtService.sign({
      sub: userA.id,
      id: userA.id,
      email: userA.email,
      roles: ['CUSTOMER'],
    });

    // 1. Create a product with stock 1
    const testProduct3 = dataSource.getRepository(Product).create({
      name: 'Product 3',
      description: 'Desc 3',
      price: 1500,
      sku: `SKU3_${Date.now()}`,
      category_id: testCategory.id,
      is_active: true,
    });
    await dataSource.getRepository(Product).save(testProduct3);
    await dataSource.getRepository(Inventory).save({
      product_id: testProduct3.id,
      available_quantity: 1,
      reserved_quantity: 0,
    });

    // 2. Add quantity 2 to cart (user wants qty 2, stock is only 1)
    await request(app.getHttpServer())
      .post('/cart/items')
      .set('Authorization', `Bearer ${tokenA}`)
      .send({ product_id: testProduct3.id, quantity: 2 })
      .expect(201);

    const idempotencyKey = generateIdempotencyKey();

    // 3. Checkout -> fails with 409 InsufficientStockException
    const failRes = await request(app.getHttpServer())
      .post('/orders/checkout')
      .set('Authorization', `Bearer ${tokenA}`)
      .send({ ...checkoutPayload, idempotency_key: idempotencyKey })
      .expect(409);

    expect(failRes.body.message).toContain('InsufficientStockException');

    // 4. Restock product so quantity 2 is available
    await dataSource.getRepository(Inventory).update(
      { product_id: testProduct3.id },
      { available_quantity: 5 },
    );

    // 5. Retry checkout with the SAME idempotency key -> should succeed (201), NOT 409
    const retryRes = await request(app.getHttpServer())
      .post('/orders/checkout')
      .set('Authorization', `Bearer ${tokenA}`)
      .send({ ...checkoutPayload, idempotency_key: idempotencyKey });

    expect(retryRes.status).toBe(201);
    expect(retryRes.body.status).toBe('PENDING_PAYMENT');
  });

  it('should handle two concurrent checkouts with the same key: one succeeds (201), other gets 409, never 500', async () => {
    // 0. Dedicated User B
    const userB = dataSource.getRepository(User).create({
      email: `userb_${Date.now()}@test.com`,
      password_hash: 'hash',
      first_name: 'User',
      last_name: 'B',
    });
    await dataSource.getRepository(User).save(userB);
    const tokenB = jwtService.sign({
      sub: userB.id,
      id: userB.id,
      email: userB.email,
      roles: ['CUSTOMER'],
    });

    // 1. Create product with stock 10
    const testProduct4 = dataSource.getRepository(Product).create({
      name: 'Product 4',
      description: 'Desc 4',
      price: 2000,
      sku: `SKU4_${Date.now()}`,
      category_id: testCategory.id,
      is_active: true,
    });
    await dataSource.getRepository(Product).save(testProduct4);
    await dataSource.getRepository(Inventory).save({
      product_id: testProduct4.id,
      available_quantity: 10,
      reserved_quantity: 0,
    });

    // 2. Add 1 item to cart
    await request(app.getHttpServer())
      .post('/cart/items')
      .set('Authorization', `Bearer ${tokenB}`)
      .send({ product_id: testProduct4.id, quantity: 1 })
      .expect(201);

    const idempotencyKey = generateIdempotencyKey();

    // 3. Fire two concurrent requests with the SAME idempotency key
    const [res1, res2] = await Promise.all([
      request(app.getHttpServer())
        .post('/orders/checkout')
        .set('Authorization', `Bearer ${tokenB}`)
        .send({ ...checkoutPayload, idempotency_key: idempotencyKey }),
      request(app.getHttpServer())
        .post('/orders/checkout')
        .set('Authorization', `Bearer ${tokenB}`)
        .send({ ...checkoutPayload, idempotency_key: idempotencyKey }),
    ]);

    const statuses = [res1.status, res2.status].sort();
    // One must be 201, one must be 409. Neither can be 500.
    expect(statuses).toEqual([201, 409]);

    const conflictRes = res1.status === 409 ? res1 : res2;
    expect(conflictRes.body.message).toContain(
      'Request with this idempotency key is already in progress',
    );
  });
});
