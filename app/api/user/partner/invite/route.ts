// app/api/user/partner/invite/route.ts
import { NextRequest, NextResponse } from "next/server";
import * as RelationshipService from "@/domains/relationship/service";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const rawEmail = typeof body?.email === "string" ? body.email.trim() : "";
    const rawUserId = typeof body?.userId === "string" ? body.userId.trim() : "";

    if (!rawEmail && !rawUserId) {
      return NextResponse.json({ error: "Email or userId is required" }, { status: 400 });
    }

    const invitation = await RelationshipService.invitePartner({
      email: rawEmail || undefined,
      userId: rawUserId || undefined,
    });

    return NextResponse.json({
      message: "Invitation sent successfully",
      invitation,
    });
  } catch (error: any) {
    console.error("Error sending partner invitation:", error);
    const status =
      error.message === "Unauthorized"
        ? 401
        : error.message === "User not found"
        ? 404
        : error.message === "Cannot invite yourself" ||
          error.message === "You already have an active partner. Disconnect first." ||
          error.message === "This user already has an active partner." ||
          error.message === "You are already connected with this user" ||
          error.message === "Invitation already pending"
        ? 400
        : 500;
    return NextResponse.json({ error: error.message || "Internal server error" }, { status });
  }
}
