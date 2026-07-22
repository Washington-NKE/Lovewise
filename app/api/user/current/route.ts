// app/api/user/current/route.ts
import { NextResponse } from "next/server";
import * as UserService from "@/domains/user/service";

export async function GET() {
  try {
    const user = await UserService.getCurrentUser();
    return NextResponse.json({
      id: user.id,
      name: user.name,
      email: user.email,
      profileImage: user.profileImage,
    });
  } catch (error: any) {
    console.error("Error fetching current user:", error);
    const status =
      error.message === "Not authenticated"
        ? 401
        : error.message === "User not found"
        ? 404
        : 500;
    return NextResponse.json({ error: error.message || "Internal server error" }, { status });
  }
}