import { getSQL, getSupabase, ensureTable } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    await ensureTable();

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

    // Upload to Supabase Storage
    const ext = file.name.split(".").pop() || "jpg";
    const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

    const bytes = await file.arrayBuffer();
    const supabase = getSupabase();
    const { error: uploadError } = await supabase.storage
      .from("photos")
      .upload(fileName, Buffer.from(bytes), {
        contentType: file.type,
        upsert: false,
      });

    if (uploadError) {
      return NextResponse.json(
        { error: `Storage upload failed: ${uploadError.message}` },
        { status: 500 }
      );
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from("photos")
      .getPublicUrl(fileName);

    const imageUrl = urlData.publicUrl;

    // Store URL (not base64) in Neon
    const sql = getSQL();
    const result = await sql`
      INSERT INTO posts (image_url, caption, author, location, latitude, longitude)
      VALUES (${imageUrl}, ${caption}, ${author}, ${location}, ${latitude}, ${longitude})
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
