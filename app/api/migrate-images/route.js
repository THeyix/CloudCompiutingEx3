
import { v2 as cloudinary } from 'cloudinary';
import { sql, init } from '@/lib/db';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(req) {
  const secret = process.env.MIGRATION_SECRET;

  if (
    !secret ||
    req.headers.get('authorization') !== `Bearer ${secret}`
  ) {
    return new Response('Unauthorized', { status: 401 });
  }

  try {
    await init();

    const rows = await sql`
      SELECT id, image_url
      FROM products
      WHERE image_url LIKE '%blob.vercel-storage.com%'
      ORDER BY id
    `;

    let migrated = 0;
    const failures = [];

    for (const row of rows) {
      try {
        const result = await cloudinary.uploader.upload(
          row.image_url,
          {
            folder: 'products',
            public_id: `migrated-${row.id}`,
            overwrite: true,
            resource_type: 'image',
          }
        );

        await sql`
          UPDATE products
          SET image_url = ${result.secure_url}
          WHERE id = ${row.id}
        `;

        migrated++;
      } catch (error) {
        console.error(`Migration failed for product ${row.id}:`, error);
        failures.push({
          id: row.id,
          error: error.message,
        });
      }
    }

    const remainingRows = await sql`
      SELECT COUNT(*)::int AS count
      FROM products
      WHERE image_url LIKE '%blob.vercel-storage.com%'
    `;

    return Response.json({
      migrated,
      failed: failures.length,
      failures,
      remaining: remainingRows[0].count,
    });
  } catch (error) {
    console.error('Image migration failed:', error);

    return Response.json(
      { error: 'Migration failed: ' + error.message },
      { status: 500 }
    );
  }
}
