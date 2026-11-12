import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { DataSource } from 'typeorm';

describe('Multi-Store E2E Resilience & Error Guards (e2e)', () => {
  let app: INestApplication;
  let dataSource: DataSource;
  let adminToken: string;
  let ownerToken: string;
  let customerToken: string;

  let activeStoreId: string;
  let suspendedStoreId: string;
  let activeProductId: string;
  let suspendedProductId: string;
  let customerId: string;
  let ownerId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        transform: true,
        forbidNonWhitelisted: true,
      }),
    );
    await app.init();

    dataSource = app.get(DataSource);

    // 1. Seed or retrieve tokens
    const adminLogin = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'admin@mwb.com', password: 'AdminPassword123!' });
    adminToken = adminLogin.body.access_token;

    const staffLogin = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'staff@mwb.com', password: 'StaffPassword123!' });
    ownerToken = staffLogin.body.access_token;
    ownerId = staffLogin.body.user.id;

    const customerLogin = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'customer@mwb.com', password: 'CustomerPassword123!' });
    customerToken = customerLogin.body.access_token;
    customerId = customerLogin.body.user.id;

    // 2. Query stores
    const stores = await dataSource.query("SELECT id, status FROM stores ORDER BY created_at ASC");
    if (stores.length > 0) {
      activeStoreId = stores[0].id;
    }

    // Create a designated suspended store for guard verification
    const susp = await dataSource.query(`
      INSERT INTO stores (name, slug, description, status, owner_id)
      VALUES ('Suspended Test Studio', 'suspended-test-studio', 'Suspended for testing', 'SUSPENDED', $1)
      ON CONFLICT (name) DO UPDATE SET status='SUSPENDED'
      RETURNING id
    `, [ownerId]);
    suspendedStoreId = susp[0].id;

    // Create an active product and a suspended store product
    const cat = await dataSource.query('SELECT id FROM categories LIMIT 1');
    const catId = cat[0].id;

    const pActive = await dataSource.query(`
      INSERT INTO products (sku, name, price, category_id, store_id, is_active)
      VALUES ('SKU-ACTIVE-TEST', 'Active Item', 2000, $1, $2, true)
      ON CONFLICT (sku) DO UPDATE SET price=2000 RETURNING id
    `, [catId, activeStoreId]);
    activeProductId = pActive[0].id;

    const pSusp = await dataSource.query(`
      INSERT INTO products (sku, name, price, category_id, store_id, is_active)
      VALUES ('SKU-SUSP-TEST', 'Suspended Store Item', 3000, $1, $2, true)
      ON CONFLICT (sku) DO UPDATE SET price=3000 RETURNING id
    `, [catId, suspendedStoreId]);
    suspendedProductId = pSusp[0].id;
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Phase 1: Customer Error Resilience', () => {
    it('TC-1.1: CartService blocks adding products from SUSPENDED stores (ERR-C01)', async () => {
      const res = await request(app.getHttpServer())
        .post('/cart/items')
        .set('Authorization', `Bearer ${customerToken}`)
        .send({ product_id: suspendedProductId, quantity: 1 });

      expect(res.status).toBe(400);
      expect(res.body.message).toMatch(/suspended and not accepting orders/i);
    });

    it('TC-1.7: Complaint submission requires minimum details length and valid store (ERR-C08)', async () => {
      // Missing store_id
      const res1 = await request(app.getHttpServer())
        .post('/complaints')
        .set('Authorization', `Bearer ${customerToken}`)
        .send({ reason: 'Broken', details: 'Short' });
      expect(res1.status).toBe(400);

      // Non-existent store
      const res2 = await request(app.getHttpServer())
        .post('/complaints')
        .set('Authorization', `Bearer ${customerToken}`)
        .send({
          store_id: '00000000-0000-0000-0000-000000000000',
          reason: 'Defective item',
          details: 'Detailed claim against non-existent store.',
        });
      expect(res2.status).toBe(404);
    });
  });

  describe('Phase 2: Owner Workspace Boundaries & State Machine', () => {
    it('TO-2.4: Reject resubmitting a request that is not in REJECTED state (ERR-O04)', async () => {
      // First create a pending request
      const createRes = await request(app.getHttpServer())
        .post('/store-requests')
        .set('Authorization', `Bearer ${ownerToken}`)
        .send({
          store_id: activeStoreId,
          requested_changes: { name: 'New Proposed Name' },
        });

      expect(createRes.status).toBe(201);
      const reqId = createRes.body.id;

      // Attempting to resubmit while still PENDING must fail
      const resubmitRes = await request(app.getHttpServer())
        .patch(`/store-requests/${reqId}/resubmit`)
        .set('Authorization', `Bearer ${ownerToken}`)
        .send({ requested_changes: { name: 'Attempted Double Edit' } });

      expect(resubmitRes.status).toBe(400);
      expect(resubmitRes.body.message).toMatch(/only rejected requests can be resubmitted/i);
    });
  });

  describe('Phase 3: Super Admin Error Handling & Operational Safeguards', () => {
    it('TA-3.3: Store creation rejects duplicate name or slug (ERR-A03)', async () => {
      const res = await request(app.getHttpServer())
        .post('/stores')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Artisan Handcrafts', // already exists
          slug: 'unique-slug-test',
          owner_id: ownerId,
        });

      expect(res.status).toBe(409);
      expect(res.body.message).toMatch(/already exists/i);
    });

    it('TA-3.5: Complaint resolution with STORE_SUSPENDED suspends the store (ERR-A05)', async () => {
      // File complaint
      const compRes = await request(app.getHttpServer())
        .post('/complaints')
        .set('Authorization', `Bearer ${customerToken}`)
        .send({
          store_id: activeStoreId,
          reason: 'Quality issue',
          details: 'Detailed investigation required.',
        });
      const compId = compRes.body.id;

      // Admin resolves with STORE_SUSPENDED
      const resolveRes = await request(app.getHttpServer())
        .patch(`/complaints/${compId}/resolve`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          status: 'RESOLVED',
          admin_action: 'STORE_SUSPENDED',
          admin_notes: 'Verified repeated policy violations.',
        });

      expect(resolveRes.status).toBe(200);
      expect(resolveRes.body.status).toBe('RESOLVED');
      expect(resolveRes.body.admin_action).toBe('STORE_SUSPENDED');

      // Verify store is now SUSPENDED in DB
      const storeDb = await dataSource.query('SELECT status FROM stores WHERE id = $1', [activeStoreId]);
      expect(storeDb[0].status).toBe('SUSPENDED');

      // Re-instate store so subsequent tests maintain health
      await dataSource.query("UPDATE stores SET status='ACTIVE' WHERE id = $1", [activeStoreId]);
    });
  });
});

