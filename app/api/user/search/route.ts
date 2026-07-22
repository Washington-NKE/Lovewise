// app/api/user/search/route.ts
import { NextRequest, NextResponse } from "next/server";
import * as UserService from "@/domains/user/service";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  try {
    const query = request.nextUrl.searchParams.get("q")?.trim() ?? "";

    if (!query || query.length < 2) {
      return NextResponse.json([]);
    }

    const users = await UserService.searchUsers(query);
    return NextResponse.json(users);
  } catch (error: any) {
    console.error("Error searching users:", error);
    const status = error.message === "Not authenticated" ? 401 : 500;
    return NextResponse.json({ error: error.message || "Internal server error" }, { status });
  }
}
