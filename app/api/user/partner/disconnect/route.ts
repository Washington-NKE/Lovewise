// app/api/user/partner/disconnect/route.ts
import { NextResponse } from "next/server";
import * as RelationshipService from "@/domains/relationship/service";

export const runtime = "nodejs";

export async function POST() {
  try {
    const result = await RelationshipService.disconnectPartner();
    return NextResponse.json(result);
  } catch (error: any) {
    console.error("Error disconnecting partner:", error);
    const status =
      error.message === "Unauthorized"
        ? 401
        : error.message === "No active relationship found"
        ? 400
        : 500;
    return NextResponse.json({ error: error.message || "Internal server error" }, { status });
  }
}