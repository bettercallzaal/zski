import { put } from "@vercel/blob";
import { sql } from "@vercel/postgres";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const caption = (formData.get("caption") as string) || "";
    const author = (formData.get("author") as string) || "Anonymous";

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Upload to Vercel Blob
    const blob = await put(`ski/${Date.now()}-${file.name}`, file, {
      access: "public",
    });

    // Save to Postgres
    const result = await sql`
      INSERT INTO posts (image_url, caption, author)
      VALUES (${blob.url}, ${caption}, ${author})
      RETURNING id, image_url, caption, author, created_at
    `;

    return NextResponse.json(result.rows[0]);
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 }
    );
  }
}
