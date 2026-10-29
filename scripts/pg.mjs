import { Pool, types } from "pg";

types.setTypeParser(20, (v) => (v === null ? null : Number(v)));
types.setTypeParser(1184, (v) => (v === null ? null : new Date(v).toISOString()));

export const pool = new Pool({
  connectionString: process.env.SUPABASE_DB_URL,
  ssl: { rejectUnauthorized: false },
  max: 2,
});

function toPg(sql) {
  let i = 0;
  return sql.replace(/\?/g, () => `$${++i}`);
}

export const q = (sql, params = []) => pool.query(toPg(sql), params);
export const one = async (sql, params = []) => (await q(sql, params)).rows[0];
export const many = async (sql, params = []) => (await q(sql, params)).rows;
export const close = () => pool.end();
