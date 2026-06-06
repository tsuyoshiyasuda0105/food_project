import { NextResponse } from "next/server";
import { fetchMaffRice } from "@/lib/maff-rice";

export async function GET() {
  try {
    return NextResponse.json(await fetchMaffRice());
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : "Unknown MAFF rice API error"
      },
      { status: 500 }
    );
  }
}
