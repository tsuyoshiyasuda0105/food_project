import { NextResponse } from "next/server";
import { fetchMaffLivestock, fetchMaffLivestockGroup } from "@/lib/maff-livestock";

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const kind = url.searchParams.get("kind");
    const date = url.searchParams.get("date") ?? undefined;

    if (kind === "pork" || kind === "beef" || kind === "egg") {
      const group = await fetchMaffLivestockGroup(kind, date);

      return NextResponse.json({
        ok: true,
        source: "農林水産省 生鮮取引電子化推進協議会 日別市況",
        generatedAt: new Date().toISOString(),
        groups: [group]
      });
    }

    const data = await fetchMaffLivestock(date);

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : "Unknown MAFF livestock API error"
      },
      { status: 500 }
    );
  }
}
