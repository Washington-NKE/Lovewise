// app/api/user/notifications/route.ts
import { NextRequest, NextResponse } from "next/server";
import * as UserService from "@/domains/user/service";

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, push, reminders, partnerActivity } = body;

    await UserService.updateNotificationPreferences({
      email,
      push,
      reminders,
      partnerActivity,
    });

    return NextResponse.json({ message: "Notification preferences updated" });
  } catch (error: any) {
    console.error("Error updating notifications:", error);
    const status = error.message === "Not authenticated" ? 401 : 500;
    return NextResponse.json({ error: error.message || "Internal server error" }, { status });
  }
}