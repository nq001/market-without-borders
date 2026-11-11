import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { AppModule } from './../src/app.module';
import { DataSource } from 'typeorm';
import { InventoryService } from './../src/inventory/inventory.service';
import { Product } from './../src/database/entities/product.entity';
import { Category } from './../src/database/entities/category.entity';
import { Inventory } from './../src/database/entities/inventory.entity';
import { InventoryMovement } from './../src/database/entities/inventory-movement.entity';

describe('Inventory Concurrency (e2e)', () => {
  let app: INestApplication;
  let dataSource: DataSource;
  let inventoryService: InventoryService;
  let testProductId: string;
  let testCategoryId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    dataSource = app.get(DataSource);
    inventoryService = app.get(InventoryService);

    // Setup Test Data
    const suffix = Date.now();
    const category = dataSource
      .getRepository(Category)
      .create({ name: `TestCat_${suffix}`, slug: `test-cat-${suffix}` });
    const savedCat = await dataSource.getRepository(Category).save(category);
    testCategoryId = savedCat.id;
  });

  afterAll(async () => {
    if (testProductId) {
      await dataSource
        .getRepository(InventoryMovement)
        .delete({ product_id: testProductId });
      await dataSource
        .getRepository(Inventory)
        .delete({ product_id: testProductId });
      await dataSource.getRepository(Product).delete({ id: testProductId });
    }
    if (testCategoryId) {
      await dataSource.getRepository(Category).delete({ id: testCategoryId });
    }
    await app.close();
  });

  it('should only allow exactly one concurrent reservation of the final unit', async () => {
    // 1. Create a product with 1 available inventory
    const product = dataSource.getRepository(Product).create({
      sku: `TEST-SKU-CONCURRENT-${Date.now()}`,
      name: 'Test Product',
      price: 1000,
      category_id: testCategoryId,
    });
    const savedProduct = await dataSource.getRepository(Product).save(product);
    testProductId = savedProduct.id;

    // The product creation in products.service.ts automatically makes inventory=0, but we are bypassing the service.
    // Let's explicitly create the inventory record
    const inventory = dataSource.getRepository(Inventory).create({
      product_id: testProductId,
      available_quantity: 1, // Final unit
      reserved_quantity: 0,
    });
    await dataSource.getRepository(Inventory).save(inventory);

    // 2. Perform two concurrent reservations
    const p1 = inventoryService.reserveInventory(
      [{ productId: testProductId, quantity: 1 }],
      'order-1',
    );
    const p2 = inventoryService.reserveInventory(
      [{ productId: testProductId, quantity: 1 }],
      'order-2',
    );

    const results = await Promise.allSettled([p1, p2]);

    // 3. Assert exactly one succeeded and one failed
    const fulfilled = results.filter((r) => r.status === 'fulfilled');
    const rejected = results.filter((r) => r.status === 'rejected');

    expect(fulfilled.length).toBe(1);
    expect(rejected.length).toBe(1);

    // Ensure the failure was due to InsufficientStockException (ConflictException)
    const error = rejected[0].reason as {
      status: number;
    };
    expect(error.status).toBe(409); // ConflictException status code

    // 4. Assert inventory invariants
    const finalInventory = await dataSource
      .getRepository(Inventory)
      .findOne({ where: { product_id: testProductId } });
    expect(finalInventory.available_quantity).toBe(0);
    expect(finalInventory.reserved_quantity).toBe(1);
  });
});
