const { Client } = require('pg');

const connectionString = "postgresql://postgres:S%40m%40r1%401205112005@db.jncjrxpnpfglbjskombd.supabase.co:5432/postgres";

async function main() {
  const client = new Client({ connectionString });
  await client.connect();
  
  const res = await client.query(`
    SELECT column_name, data_type 
    FROM information_schema.columns 
    WHERE table_name = 'Post';
  `);
  
  console.log("Columns of Post table:");
  console.log(res.rows);
  
  await client.end();
}

main().catch(console.error);
