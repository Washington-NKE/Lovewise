// app/api/user/passwor/route.ts
import { NextRequest, NextResponse } from "next/server";
import * as UserService from "@/domains/user/service";

export const runtime = "nodejs";

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { currentPassword, newPassword } = body;

    await UserService.updatePassword({ currentPassword, newPassword });

    return NextResponse.json({ message: "Password updated successfully" });
  } catch (error: any) {
    console.error("Error updating password:", error);
    const status =
      error.message === "Not authenticated"
        ? 401
        : error.message === "User not found or no password set"
        ? 404
        : error.message === "Current and new passwords are required" ||
          error.message === "New password must be at least 8 characters" ||
          error.message === "Current password is incorrect"
        ? 400
        : 500;
    return NextResponse.json({ error: error.message || "Internal server error" }, { status });
  }
}