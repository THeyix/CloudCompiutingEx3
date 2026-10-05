import { put, del } from '@vercel/blob';
import { sql, init } from '@/lib/db';
import { validate } from '@/lib/validate';

export async function GET(_, { params }) {          // READ
  await init();
  const { id } = await params;
  const [row] = await sql`SELECT * FROM products WHERE id = ${id}`;
  return row ? Response.json(row) : Response.json({ error: 'Not found' }, { status: 404 });
}

export async function PUT(req, { params }) {        // UPDATE
  await init();
  const { id } = await params;
  const { ok, errors, data } = validate(await req.formData());
  if (!ok) return Response.json({ errors }, { status: 400 });
  const [old] = await sql`SELECT * FROM products WHERE id = ${id}`;
  if (!old) return Response.json({ error: 'Not found' }, { status: 404 });
  let url = old.image_url;
  if (data.image && data.image.size > 0) {
    ({ url } = await put(`products/${Date.now()}-${data.image.name}`, data.image, { access: 'public' }));
    if (old.image_url) await del(old.image_url);
  }
  const [row] = await sql`UPDATE products SET name=${data.name}, price=${data.price},
    in_stock=${data.inStock}, release_date=${data.releaseDate}, image_url=${url}
    WHERE id=${id} RETURNING *`;
  return Response.json(row);
}

export async function DELETE(_, { params }) {       // DELETE
  await init();
  const { id } = await params;
  const [row] = await sql`DELETE FROM products WHERE id = ${id} RETURNING *`;
  if (!row) return Response.json({ error: 'Not found' }, { status: 404 });
  if (row.image_url) await del(row.image_url);
  return Response.json({ deleted: true });
}
