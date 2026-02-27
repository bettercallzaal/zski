import { sql } from "@vercel/postgres";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const location = searchParams.get("location") || "";
    const time = searchParams.get("time") || "all";

    let timeFilter = "";
    if (time === "today") {
      timeFilter = "AND created_at >= CURRENT_DATE";
    } else if (time === "weekend") {
      // Current weekend: from last Friday 6pm to Sunday 11:59pm
      timeFilter =
        "AND created_at >= (CURRENT_DATE - ((EXTRACT(DOW FROM CURRENT_DATE)::int + 2) % 7) * INTERVAL '1 day')";
    }

    const locationFilter = location
      ? "AND LOWER(location) LIKE LOWER($1)"
      : "";
    const locationParam = location ? `%${location}%` : "";

    // Build query with conditional filters
    // Using tagged template literals with @vercel/postgres requires separate queries
    if (location && timeFilter) {
      const result = await sql.query(
        `SELECT id, image_url, caption, author, location, latitude, longitude, created_at
         FROM posts
         WHERE 1=1 ${timeFilter} AND LOWER(location) LIKE LOWER($1)
         ORDER BY created_at DESC`,
        [locationParam]
      );
      return NextResponse.json(result.rows);
    } else if (location) {
      const result = await sql.query(
        `SELECT id, image_url, caption, author, location, latitude, longitude, created_at
         FROM posts
         WHERE LOWER(location) LIKE LOWER($1)
         ORDER BY created_at DESC`,
        [locationParam]
      );
      return NextResponse.json(result.rows);
    } else if (timeFilter) {
      const result = await sql.query(
        `SELECT id, image_url, caption, author, location, latitude, longitude, created_at
         FROM posts
         WHERE 1=1 ${timeFilter}
         ORDER BY created_at DESC`
      );
      return NextResponse.json(result.rows);
    } else {
      const result = await sql`
        SELECT id, image_url, caption, author, location, latitude, longitude, created_at
        FROM posts
        ORDER BY created_at DESC
      `;
      return NextResponse.json(result.rows);
    }
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 }
    );
  }
}
