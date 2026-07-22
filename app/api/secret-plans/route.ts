// app/api/secret-plans/route.ts
import { NextRequest, NextResponse } from "next/server";
import * as SecretPlanService from "@/domains/secret-plan/service";
import * as UserService from "@/domains/user/service";

export async function GET() {
  try {
    const user = await UserService.getCurrentUser();
    const plans = await SecretPlanService.getSecretPlans(user.id);
    return NextResponse.json(plans);
  } catch (error: any) {
    console.error("Error fetching secret plans:", error);
    const status =
      error.message === "Not authenticated"
        ? 401
        : error.message === "User not found"
        ? 404
        : 500;
    return NextResponse.json({ error: error.message || "Internal server error" }, { status });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await UserService.getCurrentUser();
    const body = await request.json();

    const plan = await SecretPlanService.createSecretPlan({
      ...body,
      userId: user.id,
    });

    return NextResponse.json(plan, { status: 201 });
  } catch (error: any) {
    console.error("Error creating secret plan:", error);
    const status =
      error.message === "Not authenticated"
        ? 401
        : error.message === "User not found"
        ? 404
        : 500;
    return NextResponse.json({ error: error.message || "Internal server error" }, { status });
  }
}