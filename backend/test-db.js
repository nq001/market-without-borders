const { Client } = require('pg');

async function test() {
  const client = new Client({
    connectionString: 'postgres://postgres:2468@127.0.0.1:5433/postgres'
  });
  
  await client.connect();
  const res = await client.query('SELECT datname FROM pg_database');
  console.log("Databases:");
  console.log(res.rows.map(r => r.datname));
  await client.end();
}

test().catch(console.error);
