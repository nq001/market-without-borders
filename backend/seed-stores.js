const { Client } = require('pg');

const client = new Client({
  connectionString: 'postgres://postgres:2468@127.0.0.1:5432/commerce_dev',
});

async function seed() {
  await client.connect();
  console.log('Connected for store seeding');

  const staff = await client.query("SELECT id FROM users WHERE email='staff@mwb.com'");
  if (staff.rows.length > 0) {
    const ownerId = staff.rows[0].id;

    // ensure owner role assigned to staff
    const ownerRole = await client.query("SELECT id FROM roles WHERE name='OWNER'");
    if (ownerRole.rows.length > 0) {
      await client.query(
        'INSERT INTO user_roles (user_id, role_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
        [ownerId, ownerRole.rows[0].id]
      );
    }

    // Seed default stores
    const s1 = await client.query(`
      INSERT INTO stores (name, slug, description, status, owner_id)
      VALUES ('Artisan Handcrafts', 'artisan-handcrafts', 'Authentic pottery and wooden crafts', 'ACTIVE', $1)
      ON CONFLICT (name) DO UPDATE SET status='ACTIVE'
      RETURNING id
    `, [ownerId]);

    const s2 = await client.query(`
      INSERT INTO stores (name, slug, description, status, owner_id)
      VALUES ('Heritage Textiles', 'heritage-textiles', 'Organic woven blankets and linens', 'ACTIVE', $1)
      ON CONFLICT (name) DO UPDATE SET status='ACTIVE'
      RETURNING id
    `, [ownerId]);

    const s1Id = s1.rows[0]?.id;
    const s2Id = s2.rows[0]?.id;

    // Link to categories
    const cats = await client.query('SELECT id FROM categories LIMIT 4');
    if (cats.rows.length > 0 && s1Id) {
      await client.query(
        'INSERT INTO store_categories (store_id, category_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
        [s1Id, cats.rows[0].id]
      );
      if (cats.rows.length > 1 && s2Id) {
        await client.query(
          'INSERT INTO store_categories (store_id, category_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
          [s2Id, cats.rows[1].id]
        );
      }
    }

    // Assign unassigned products to s1
    if (s1Id) {
      await client.query('UPDATE products SET store_id=$1 WHERE store_id IS NULL', [s1Id]);
    }

    console.log('SEED_STORES_SUCCESS');
  }

  await client.end();
}

seed().catch((e) => {
  console.error('SEED_FAILED:', e);
  process.exit(1);
});

