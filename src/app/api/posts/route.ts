import { ensureTable } from "@/lib/db";
import { Pool } from "@neondatabase/serverless";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  await ensureTable();
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });

  try {
    const { searchParams } = new URL(request.url);
    const location = searchParams.get("location") || "";
    const time = searchParams.get("time") || "all";

    const conditions: string[] = [];
    const params: unknown[] = [];
    let paramIndex = 1;

    if (time === "today") {
      conditions.push("created_at >= CURRENT_DATE");
    } else if (time === "weekend") {
      conditions.push(
        "created_at >= (CURRENT_DATE - ((EXTRACT(DOW FROM CURRENT_DATE)::int + 2) % 7) * INTERVAL '1 day')"
      );
    }

    if (location) {
      conditions.push(`LOWER(location) LIKE LOWER($${paramIndex})`);
      params.push(`%${location}%`);
      paramIndex++;
    }

    const where = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

    const query = `
      SELECT id, image_url, caption, author, location, latitude, longitude, created_at
      FROM posts
      ${where}
      ORDER BY created_at DESC
    `;

    const { rows } = await pool.query(query, params);
    return NextResponse.json(rows);
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 }
    );
  } finally {
    await pool.end();
  }
}
