import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json(
    {
      ok: false,
      status: "paused",
      source: "JAFIC",
      error: "JAFIC fish scraping is paused until commercial reuse and redistribution terms are confirmed."
    },
    { status: 423 }
  );
}
