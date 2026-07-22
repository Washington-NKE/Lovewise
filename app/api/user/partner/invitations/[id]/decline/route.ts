// app/api/user/partner/invitations/[id]/decline/route.ts
import { NextRequest, NextResponse } from "next/server";
import * as RelationshipService from "@/domains/relationship/service";

export const runtime = "nodejs";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const result = await RelationshipService.declineInvitation(id);
    return NextResponse.json(result);
  } catch (error: any) {
    console.error("Error declining invitation:", error);
    const status =
      error.message === "Unauthorized"
        ? 401
        : error.message === "Invitation not found"
        ? 404
        : error.message === "Invitation is no longer valid"
        ? 400
        : 500;
    return NextResponse.json({ error: error.message || "Internal server error" }, { status });
  }
}