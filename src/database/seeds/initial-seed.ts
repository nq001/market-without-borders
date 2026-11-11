import { DataSource } from 'typeorm';
import { dataSourceOptions } from '../data-source';
import { Role } from '../entities/role.entity';
import { Permission } from '../entities/permission.entity';
import { Category } from '../entities/category.entity';
import { Product } from '../entities/product.entity';
import { Inventory } from '../entities/inventory.entity';
import { RolePermission } from '../entities/role-permission.entity';
import { PermissionAction } from '../../common/constants/permissions.enum';

async function seed() {
  const dataSource = new DataSource(dataSourceOptions);
  await dataSource.initialize();

  console.log('Database connected, starting seed...');

  const roleRepo = dataSource.getRepository(Role);
  const permRepo = dataSource.getRepository(Permission);
  const rolePermRepo = dataSource.getRepository(RolePermission);
  const categoryRepo = dataSource.getRepository(Category);
  const productRepo = dataSource.getRepository(Product);
  const inventoryRepo = dataSource.getRepository(Inventory);

  await dataSource.query(
    'TRUNCATE TABLE products, categories, role_permissions, permissions, roles, inventories CASCADE',
  );

  console.log('Cleared existing data.');

  // Seed all canonical and controller permission actions
  const allPermissionActions = Object.values(PermissionAction);
  const savedPermissions = await permRepo.save(
    allPermissionActions.map((action) => permRepo.create({ action })),
  );

  // Create roles
  const adminRole = roleRepo.create({
    name: 'ADMIN',
    description: 'Full access',
  });
  const staffRole = roleRepo.create({
    name: 'STAFF',
    description: 'Catalog, inventory, and shipping staff access',
  });
  const customerRole = roleRepo.create({
    name: 'CUSTOMER',
    description: 'Standard customer',
  });
  await roleRepo.save([adminRole, staffRole, customerRole]);

  // Assign all permissions to ADMIN and STAFF
  await rolePermRepo.save(
    savedPermissions.map((permission) =>
      rolePermRepo.create({ role: adminRole, permission }),
    ),
  );
  await rolePermRepo.save(
    savedPermissions.map((permission) =>
      rolePermRepo.create({ role: staffRole, permission }),
    ),
  );

  // Create categories
  const electronics = categoryRepo.create({
    name: 'Electronics',
    slug: 'electronics',
  });
  await categoryRepo.save(electronics);

  const laptops = categoryRepo.create({
    name: 'Laptops',
    slug: 'laptops',
    parent: electronics,
  });
  await categoryRepo.save(laptops);

  // Create products
  const product1 = productRepo.create({
    sku: 'LAP-123',
    name: 'Pro Laptop 15"',
    description: 'High performance laptop for professionals.',
    price: 150000, // $1500.00
    category: laptops,
  });
  await productRepo.save(product1);

  // Create inventory
  const inventory1 = inventoryRepo.create({
    product: product1,
    available_quantity: 50,
  });
  await inventoryRepo.save(inventory1);

  console.log('Seed completed successfully!');
  await dataSource.destroy();
}

seed().catch((error) => {
  console.error('Seeding failed:', error);
  process.exit(1);
});
