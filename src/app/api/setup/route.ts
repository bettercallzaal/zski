import { sql } from "@vercel/postgres";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    await sql`
      CREATE TABLE IF NOT EXISTS posts (
        id SERIAL PRIMARY KEY,
        image_url TEXT NOT NULL,
        caption TEXT DEFAULT '',
        author TEXT DEFAULT 'Anonymous',
        created_at TIMESTAMP DEFAULT NOW()
      )
    `;
    return NextResponse.json({ message: "Table created successfully" });
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 }
    );
  }
}
