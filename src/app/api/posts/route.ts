import { sql } from "@vercel/postgres";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const result = await sql`
      SELECT id, image_url, caption, author, created_at
      FROM posts
      ORDER BY created_at DESC
    `;
    return NextResponse.json(result.rows);
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 }
    );
  }
}
