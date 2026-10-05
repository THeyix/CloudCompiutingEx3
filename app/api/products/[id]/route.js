import { put, del } from '@vercel/blob';
import { sql, init } from '@/lib/db';
import { validate } from '@/lib/validate';

const fail = (what, e) =>
  Response.json({ error: `${what} failed: ${e.message}` }, { status: 500 });

export async function GET(_, { params }) {
  try {
    await init();
    const { id } = await params;
    const [row] = await sql`SELECT * FROM products WHERE id = ${id}`;
    return row ? Response.json(row) : Response.json({ error: 'Not found' }, { status: 404 });
  } catch (e) {
    return fail('Read', e);
  }
}

export async function PUT(req, { params }) {
  try {
    await init();
    const { id } = await params;
    const { ok, errors, data } = validate(await req.formData());
    if (!ok) return Response.json({ errors }, { status: 400 });

    const [old] = await sql`SELECT * FROM products WHERE id = ${id}`;
    if (!old) return Response.json({ error: 'Not found' }, { status: 404 });

    let url = old.image_url;
    if (data.image && data.image.size > 0) {
      ({ url } = await put(`products/${Date.now()}-${data.image.name}`, data.image, {
        access: 'public',
      }));
      if (old.image_url) { try { await del(old.image_url); } catch {} }
    }
    const [row] = await sql`UPDATE products SET name=${data.name}, price=${data.price},
      in_stock=${data.inStock}, release_date=${data.releaseDate}, image_url=${url}
      WHERE id=${id} RETURNING *`;
    return Response.json(row);
  } catch (e) {
    return fail('Update', e);
  }
}

export async function DELETE(_, { params }) {
  try {
    await init();
    const { id } = await params;
    const [row] = await sql`DELETE FROM products WHERE id = ${id} RETURNING *`;
    if (!row) return Response.json({ error: 'Not found' }, { status: 404 });
    if (row.image_url) { try { await del(row.image_url); } catch {} }
    return Response.json({ deleted: true });
  } catch (e) {
    return fail('Delete', e);
  }
}
