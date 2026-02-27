import { getSQL, ensureTable } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    await ensureTable();
    const sql = getSQL();

    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const caption = (formData.get("caption") as string) || "";
    const author = (formData.get("author") as string) || "Anonymous";
    const location = (formData.get("location") as string) || null;
    const latStr = formData.get("latitude") as string | null;
    const lngStr = formData.get("longitude") as string | null;
    const latitude = latStr ? parseFloat(latStr) : null;
    const longitude = lngStr ? parseFloat(lngStr) : null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Convert file to base64 data URL
    const bytes = await file.arrayBuffer();
    const base64 = Buffer.from(bytes).toString("base64");
    const dataUrl = `data:${file.type};base64,${base64}`;

    const result = await sql`
      INSERT INTO posts (image_url, caption, author, location, latitude, longitude)
      VALUES (${dataUrl}, ${caption}, ${author}, ${location}, ${latitude}, ${longitude})
      RETURNING id, image_url, caption, author, location, latitude, longitude, created_at
    `;

    return NextResponse.json(result[0]);
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 }
    );
  }
}
