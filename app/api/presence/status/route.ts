// app/api/presence/status/route.ts
import { NextRequest, NextResponse } from "next/server";
import * as PresenceService from "@/domains/presence/service";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const targetUserId = searchParams.get("userId");

    if (!targetUserId) {
      return NextResponse.json({ error: "User ID required" }, { status: 400 });
    }

    const payload = await PresenceService.getUserPresenceStatus(targetUserId);

    return NextResponse.json(payload, {
      headers: {
        "Cache-Control": "private, max-age=0, s-maxage=5, stale-while-revalidate=25",
      },
    });
  } catch (error: any) {
    console.error("Error fetching presence status:", error);
    const status =
      error.message === "Unauthorized"
        ? 401
        : error.message === "User not found"
        ? 404
        : 500;
    return NextResponse.json({ error: error.message || "Internal server error" }, { status });
  }
}
