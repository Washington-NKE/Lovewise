// app/api/relationships/active/route.ts
import { NextRequest, NextResponse } from "next/server";
import * as RelationshipService from "@/domains/relationship/service";

export async function GET(req: NextRequest) {
  try {
    const relationship = await RelationshipService.getCurrentUserRelationshipDetails();

    if (!relationship) {
      return NextResponse.json({ error: "No active relationship found" }, { status: 404 });
    }

    return NextResponse.json(relationship);
  } catch (error: any) {
    console.error("Error fetching active relationship:", error);
    const status = error.message === "Not authenticated" ? 401 : 500;
    return NextResponse.json({ error: error.message || "Internal server error" }, { status });
  }
}