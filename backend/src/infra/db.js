import pkg from 'pg';
const { Pool } = pkg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export async function query(sql, params) {
  const { rows } = await pool.query(sql, params);
  return rows;
}

export async function insert(sql, params) {
  const { rows } = await pool.query(sql + ' RETURNING *', params);
  return rows[0];
}

export async function update(sql, params) {
  const { rows } = await pool.query(sql + ' RETURNING *', params);
  return rows[0];
}