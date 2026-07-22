// app/api/presence/update/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import * as PresenceRepository from "@/domains/presence/repository";
import * as RelationshipRepository from "@/domains/relationship/repository";

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { userId, timestamp } = await request.json();

    if (userId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await PresenceRepository.updateUserPresence(userId, new Date(timestamp));

    const relationship = await RelationshipRepository.findActiveRelationshipWithDetails(userId);
    let partnerInfo = null;
    if (relationship) {
      const partner = relationship.userId === userId ? relationship.partner : relationship.user;
      if (partner) {
        partnerInfo = {
          id: partner.id,
          name: partner.name,
          lastActive: partner.lastActive,
        };
      }
    }

    return NextResponse.json({
      success: true,
      partner: partnerInfo,
    });
  } catch (error: any) {
    console.error("Error updating presence:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}