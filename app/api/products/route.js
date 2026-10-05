import { put } from '@vercel/blob';
import { sql, init } from '@/lib/db';
import { validate } from '@/lib/validate';

export async function GET() {                       // LIST
  await init();
  const rows = await sql`SELECT * FROM products ORDER BY id DESC`;
  return Response.json(rows);
}

export async function POST(req) {                   // CREATE
  await init();
  const { ok, errors, data } = validate(await req.formData());
  if (!ok) return Response.json({ errors }, { status: 400 });
  let url = null;
  if (data.image && data.image.size > 0) {
    ({ url } = await put(`products/${Date.now()}-${data.image.name}`, data.image, { access: 'public' }));
  }
  const [row] = await sql`INSERT INTO products (name, price, in_stock, release_date, image_url)
    VALUES (${data.name}, ${data.price}, ${data.inStock}, ${data.releaseDate}, ${url}) RETURNING *`;
  return Response.json(row, { status: 201 });
}
