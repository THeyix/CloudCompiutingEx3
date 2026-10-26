import { v2 as cloudinary } from 'cloudinary';
import { sql, init } from '@/lib/db';
import { validate } from '@/lib/validate';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function GET() {
  try {
    await init();
    const rows = await sql`SELECT * FROM products ORDER BY id DESC`;
    return Response.json(rows);
  } catch (e) {
    return Response.json(
      { error: 'GET failed: ' + e.message },
      { status: 500 }
    );
  }
}

export async function POST(req) {
  try {
    await init();

    const { ok, errors, data } = validate(await req.formData());

    if (!ok) {
      return Response.json({ errors }, { status: 400 });
    }

    let url = null;

    if (data.image && data.image.size > 0) {
      const buffer = Buffer.from(await data.image.arrayBuffer());
      const base64 = buffer.toString('base64');
      const mimeType = data.image.type || 'image/jpeg';

      const result = await cloudinary.uploader.upload(
        `data:${mimeType};base64,${base64}`,
        {
          folder: 'products',
          resource_type: 'image',
        }
      );

      url = result.secure_url;
    }

    const [row] = await sql`
      INSERT INTO products
        (name, price, in_stock, release_date, image_url)
      VALUES
        (${data.name}, ${data.price}, ${data.inStock},
         ${data.releaseDate}, ${url})
      RETURNING *
    `;

    return Response.json(row, { status: 201 });
  } catch (e) {
    console.error('Create failed:', e);

    return Response.json(
      { error: 'Create failed: ' + e.message },
      { status: 500 }
    );
  }
}
