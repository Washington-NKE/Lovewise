// app/api/secret-plan-item/route.ts
import { NextRequest, NextResponse } from "next/server";
import * as SecretPlanService from "@/domains/secret-plan/service";

export const runtime = "nodejs";

export async function GET() {
  try {
    const secretPlanItems = await SecretPlanService.getSecretPlanItems();
    return NextResponse.json(secretPlanItems);
  } catch (error: any) {
    console.error("Error fetching secret plan items:", error);
    const status = error.message === "Not authenticated" ? 401 : 500;
    return NextResponse.json({ error: error.message || "Internal server error" }, { status });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { secretPlanId, item, cost, notes } = body;

    if (!secretPlanId || !item) {
      return NextResponse.json({ error: "Secret plan ID and item are required" }, { status: 400 });
    }

    const secretPlanItem = await SecretPlanService.createSecretPlanItem({
      item,
      cost,
      notes,
      planId: secretPlanId,
    });

    return NextResponse.json(secretPlanItem);
  } catch (error: any) {
    console.error("Error creating secret plan item:", error);
    const status =
      error.message === "Not authenticated"
        ? 401
        : error.message === "Secret plan not found"
        ? 404
        : 500;
    return NextResponse.json({ error: error.message || "Internal server error" }, { status });
  }
}