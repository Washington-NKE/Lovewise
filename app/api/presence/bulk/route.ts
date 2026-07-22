// app/api/presence/bulk/route.ts
import { NextRequest, NextResponse } from "next/server";
import * as PresenceService from "@/domains/presence/service";

export async function POST(request: NextRequest) {
  try {
    const { userIds } = await request.json();

    if (!userIds || !Array.isArray(userIds)) {
      return NextResponse.json({ error: "User IDs array required" }, { status: 400 });
    }

    const presenceData = await PresenceService.getUsersPresenceBulk(userIds);
    return NextResponse.json({ presenceData });
  } catch (error: any) {
    console.error("Error fetching bulk presence status:", error);
    const status = error.message === "Unauthorized" ? 401 : 500;
    return NextResponse.json({ error: error.message || "Internal server error" }, { status });
  }
}