import { Pool } from 'pg';

// Supabase pooler нь нэгэн зэрэг холболтын тоог хязгаарладаг (session mode: 15).
// - Pool-ийг globalThis дээр хадгалснаар dev орчинд HMR бүрт шинэ Pool үүсэхгүй
// - max-аар нэг процесс хэдэн холболт эзлэхийг хязгаарлана (илүү query дараалалд орно)
const globalForDb = globalThis as unknown as { pgPool?: Pool };

export const pool =
  globalForDb.pgPool ??
  new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
      rejectUnauthorized: false,
    },
    max: Number(process.env.DB_POOL_MAX ?? 5),
    idleTimeoutMillis: 10_000,
    connectionTimeoutMillis: 10_000,
  });

if (process.env.NODE_ENV !== 'production') {
  globalForDb.pgPool = pool;
}
