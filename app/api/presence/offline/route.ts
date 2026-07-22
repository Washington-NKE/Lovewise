// app/api/presence/offline/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import * as PresenceRepository from "@/domains/presence/repository";

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { userId } = await request.json();

    if (userId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Set user offline (10 mins ago) or update to now (original behaviour)
    // To match original behavior exactly:
    await PresenceRepository.updateUserPresence(userId, new Date());

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error updating offline status:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
