import { NextResponse } from "next/server";
import { getLocalArchiveStatus } from "@/lib/local-archive";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json({
    ok: true,
    ...getLocalArchiveStatus()
  });
}
