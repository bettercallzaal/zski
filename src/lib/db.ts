import { neon, Pool, type NeonQueryFunction } from "@neondatabase/serverless";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

// Lazy singletons — initialized on first use so build doesn't crash without env vars

let _sql: NeonQueryFunction<false, false>;
export function getSQL() {
  if (!_sql) _sql = neon(process.env.POSTGRES_URL || process.env.DATABASE_URL!);
  return _sql;
}

let _pool: Pool;
export function getPool() {
  if (!_pool) _pool = new Pool({ connectionString: process.env.POSTGRES_URL || process.env.DATABASE_URL });
  return _pool;
}

let _supabase: SupabaseClient;
export function getSupabase() {
  if (!_supabase) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;
    if (!url || !key) {
      throw new Error(
        `Missing Supabase env vars. Have: ${Object.keys(process.env).filter(k => k.includes("SUPABASE")).join(", ") || "none"}`
      );
    }
    _supabase = createClient(url, key);
  }
  return _supabase;
}

export async function ensureTable() {
  const sql = getSQL();
  await sql`
    CREATE TABLE IF NOT EXISTS posts (
      id SERIAL PRIMARY KEY,
      image_url TEXT NOT NULL,
      caption TEXT DEFAULT '',
      author TEXT DEFAULT 'Anonymous',
      location TEXT,
      latitude DOUBLE PRECISION,
      longitude DOUBLE PRECISION,
      created_at TIMESTAMP DEFAULT NOW()
    )
  `;
}
