const bcrypt = require('bcrypt');
const { DataSource } = require('typeorm');
const { dataSourceOptions } = require('./dist/database/data-source');

async function seedUsers() {
  const ds = new DataSource(dataSourceOptions);
  await ds.initialize();
  console.log('Connected to database...');

  // Ensure Roles exist
  const roles = await ds.query('SELECT * FROM roles');
  let adminRole = roles.find((r) => r.name === 'ADMIN');
  let staffRole = roles.find((r) => r.name === 'STAFF');
  let customerRole = roles.find((r) => r.name === 'CUSTOMER');

  if (!adminRole) {
    const res = await ds.query("INSERT INTO roles (id, name, description) VALUES (gen_random_uuid(), 'ADMIN', 'Full Administrator') RETURNING *");
    adminRole = res[0];
  }
  if (!staffRole) {
    const res = await ds.query("INSERT INTO roles (id, name, description) VALUES (gen_random_uuid(), 'STAFF', 'Staff Operator') RETURNING *");
    staffRole = res[0];
  }
  if (!customerRole) {
    const res = await ds.query("INSERT INTO roles (id, name, description) VALUES (gen_random_uuid(), 'CUSTOMER', 'Standard Customer') RETURNING *");
    customerRole = res[0];
  }

  const usersToSeed = [
    {
      email: 'admin@mwb.com',
      password: 'AdminPassword123!',
      first_name: 'Super',
      last_name: 'Admin',
      roleId: adminRole.id,
      roleName: 'ADMIN',
    },
    {
      email: 'staff@mwb.com',
      password: 'StaffPassword123!',
      first_name: 'Fulfillment',
      last_name: 'Staff',
      roleId: staffRole.id,
      roleName: 'STAFF',
    },
    {
      email: 'customer@mwb.com',
      password: 'CustomerPassword123!',
      first_name: 'Jane',
      last_name: 'Customer',
      roleId: customerRole.id,
      roleName: 'CUSTOMER',
    },
  ];

  for (const u of usersToSeed) {
    const existing = await ds.query('SELECT * FROM users WHERE email = $1', [u.email]);
    const hash = await bcrypt.hash(u.password, 10);
    let userId;

    if (existing.length > 0) {
      userId = existing[0].id;
      await ds.query(
        'UPDATE users SET password_hash = $1, first_name = $2, last_name = $3, is_active = true WHERE id = $4',
        [hash, u.first_name, u.last_name, userId],
      );
      console.log(`Updated user ${u.email}`);
    } else {
      const res = await ds.query(
        'INSERT INTO users (id, email, password_hash, first_name, last_name, is_active) VALUES (gen_random_uuid(), $1, $2, $3, $4, true) RETURNING id',
        [u.email, hash, u.first_name, u.last_name],
      );
      userId = res[0].id;
      console.log(`Created user ${u.email}`);
    }

    // Attach role in user_roles
    await ds.query('DELETE FROM user_roles WHERE user_id = $1', [userId]);
    await ds.query('INSERT INTO user_roles (user_id, role_id) VALUES ($1, $2)', [userId, u.roleId]);
    console.log(`Assigned role ${u.roleName} to ${u.email}`);
  }

  console.log('All platform users seeded successfully!');
  await ds.destroy();
}

seedUsers().catch((err) => {
  console.error('Error seeding users:', err);
  process.exit(1);
});

