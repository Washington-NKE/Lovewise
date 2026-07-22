// app/api/user/partner/invitations/route.ts
import { NextResponse } from "next/server";
import * as RelationshipService from "@/domains/relationship/service";

export const runtime = "nodejs";

export async function GET() {
  try {
    const invitations = await RelationshipService.getInvitations();

    return NextResponse.json(invitations, {
      headers: {
        "Cache-Control": "private, max-age=0, s-maxage=5, stale-while-revalidate=20",
      },
    });
  } catch (error: any) {
    console.error("Error fetching invitations:", error);
    const status = error.message === "Unauthorized" ? 401 : 500;
    return NextResponse.json({ error: error.message || "Internal server error" }, { status });
  }
}
