# Products CRUD on Vercel
Stack: Next.js, Neon Postgres, Vercel Blob, Vercel Cron.
Env vars (Vercel sets them when you connect Neon + Blob): DATABASE_URL, BLOB_READ_WRITE_TOKEN. Add CRON_SECRET manually (any random string).
API: GET/POST /api/products, GET/PUT/DELETE /api/products/:id (multipart/form-data: name, price, inStock, releaseDate, image).
