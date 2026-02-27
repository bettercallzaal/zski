import { ensureTable } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    await ensureTable();
    return NextResponse.json({ message: "Table created successfully" });
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 }
    );
  }
}
