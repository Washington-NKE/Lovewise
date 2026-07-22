// app/api/user/profile/route.ts
import { NextRequest, NextResponse } from "next/server";
import * as UserService from "@/domains/user/service";
import * as RelationshipService from "@/domains/relationship/service";

export async function GET() {
  try {
    const user = await UserService.getCurrentUser();
    const relationship = await RelationshipService.getCurrentUserRelationshipDetails();

    const partner = relationship
      ? (relationship.userId === user.id ? relationship.partner : relationship.user)
      : null;

    const userData = {
      id: user.id,
      name: user.name,
      email: user.email,
      bio: user.bio,
      emailNotifications: user.emailNotifications,
      pushNotifications: user.pushNotifications,
      eventReminders: user.eventReminders,
      partnerActivityNotifications: user.partnerActivityNotifications,
      privateJournalDefault: user.privateJournalDefault,
      partner,
      notifications: {
        email: user.emailNotifications,
        push: user.pushNotifications,
        reminders: user.eventReminders,
        partnerActivity: user.partnerActivityNotifications,
      },
    };

    return NextResponse.json(userData);
  } catch (error: any) {
    console.error("Error fetching user profile:", error);
    const status =
      error.message === "Not authenticated"
        ? 401
        : error.message === "User not found"
        ? 404
        : 500;
    return NextResponse.json({ error: error.message || "Internal server error" }, { status });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, bio } = body;

    await UserService.updateUserProfile({ name, email, bio });

    return NextResponse.json({ message: "Profile updated successfully" });
  } catch (error: any) {
    console.error("Error updating user profile:", error);
    const status =
      error.message === "Not authenticated"
        ? 401
        : error.message === "Email already in use"
        ? 400
        : 500;
    return NextResponse.json({ error: error.message || "Internal server error" }, { status });
  }
}
