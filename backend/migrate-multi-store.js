const { Client } = require('pg');

const client = new Client({
  connectionString: 'postgres://postgres:2468@127.0.0.1:5432/commerce_dev',
});

async function run() {
  await client.connect();
  console.log('Connected to DB');

  // 1. Add approval_status to users
  await client.query(`
    DO $block$ BEGIN
      IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='approval_status') THEN
        ALTER TABLE users ADD COLUMN approval_status VARCHAR(50) DEFAULT 'ACTIVE';
      END IF;
    END $block$;
  `);

  // 2. Create stores table
  await client.query(`
    CREATE TABLE IF NOT EXISTS stores (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      name VARCHAR(255) UNIQUE NOT NULL,
      slug VARCHAR(255) UNIQUE NOT NULL,
      description TEXT,
      status VARCHAR(50) DEFAULT 'ACTIVE',
      owner_id UUID REFERENCES users(id) ON DELETE SET NULL,
      banner_url VARCHAR(500),
      theme_config JSONB,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      deleted_at TIMESTAMP WITH TIME ZONE
    );
  `);

  // 3. Create store_categories table
  await client.query(`
    CREATE TABLE IF NOT EXISTS store_categories (
      store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
      category_id UUID NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      PRIMARY KEY (store_id, category_id)
    );
  `);

  // 4. Create complaints table
  await client.query(`
    CREATE TABLE IF NOT EXISTS complaints (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      customer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
      order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
      reason VARCHAR(255) NOT NULL,
      details TEXT NOT NULL,
      status VARCHAR(50) DEFAULT 'PENDING',
      admin_action VARCHAR(50) DEFAULT 'NONE',
      admin_notes TEXT,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
  `);

  // 5. Create store_edit_requests table
  await client.query(`
    CREATE TABLE IF NOT EXISTS store_edit_requests (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
      owner_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      requested_changes JSONB NOT NULL,
      status VARCHAR(50) DEFAULT 'PENDING',
      rejection_reason TEXT,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
  `);

  // 6. Add store_id to products
  await client.query(`
    DO $block$ BEGIN
      IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='products' AND column_name='store_id') THEN
        ALTER TABLE products ADD COLUMN store_id UUID REFERENCES stores(id) ON DELETE CASCADE;
      END IF;
    END $block$;
  `);

  // 7. Add store_id and parent_order_id to orders
  await client.query(`
    DO $block$ BEGIN
      IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='orders' AND column_name='store_id') THEN
        ALTER TABLE orders ADD COLUMN store_id UUID REFERENCES stores(id) ON DELETE SET NULL;
      END IF;
      IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='orders' AND column_name='parent_order_id') THEN
        ALTER TABLE orders ADD COLUMN parent_order_id UUID REFERENCES orders(id) ON DELETE SET NULL;
      END IF;
    END $block$;
  `);

  // 8. Ensure OWNER role exists
  await client.query(`
    DO $block$ BEGIN
      IF NOT EXISTS (SELECT 1 FROM roles WHERE name='OWNER') THEN
        INSERT INTO roles (id, name, description) VALUES (gen_random_uuid(), 'OWNER', 'Store owner and operator');
      END IF;
    END $block$;
  `);

  console.log('MIGRATION_COMPLETED_SUCCESSFULLY');
  await client.end();
}

run().catch((e) => {
  console.error('MIGRATION_FAILED:', e);
  process.exit(1);
});
