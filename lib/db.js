import { neon } from '@neondatabase/serverless';
export const sql = neon(process.env.DATABASE_URL);

let ready = false;
export async function init() {
  if (ready) return;
  await sql`CREATE TABLE IF NOT EXISTS products (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    price NUMERIC(10,2) NOT NULL,
    in_stock BOOLEAN NOT NULL,
    release_date DATE NOT NULL,
    image_url TEXT,
    released BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now()
  )`;
  ready = true;
}
