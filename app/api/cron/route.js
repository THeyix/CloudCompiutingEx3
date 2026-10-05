import { sql, init } from '@/lib/db';

// Background job (Vercel Cron, hourly): flag products whose release date has arrived
export async function GET(req) {
  if (req.headers.get('authorization') !== `Bearer ${process.env.CRON_SECRET}`)
    return new Response('Unauthorized', { status: 401 });
  await init();
  const rows = await sql`UPDATE products SET released = true
    WHERE released = false AND release_date <= CURRENT_DATE RETURNING id`;
  return Response.json({ updated: rows.length });
}
