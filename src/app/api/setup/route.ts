import { neon } from "@neondatabase/serverless";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const sql = neon(process.env.DATABASE_URL!);

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

    await sql`ALTER TABLE posts ADD COLUMN IF NOT EXISTS location TEXT`;
    await sql`ALTER TABLE posts ADD COLUMN IF NOT EXISTS latitude DOUBLE PRECISION`;
    await sql`ALTER TABLE posts ADD COLUMN IF NOT EXISTS longitude DOUBLE PRECISION`;

    return NextResponse.json({ message: "Table created and migrated successfully" });
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 }
    );
  }
}
