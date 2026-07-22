// app/api/secret-plans/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import * as SecretPlanService from "@/domains/secret-plan/service";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { title, description, budget, targetDate, progress } = body;

    const updatedPlan = await SecretPlanService.updateSecretPlan(id, {
      title,
      description,
      budget,
      targetDate,
      progress,
    });

    return NextResponse.json(updatedPlan);
  } catch (error: any) {
    console.error("Error updating secret plan:", error);
    const status =
      error.message === "Not authenticated"
        ? 401
        : error.message === "Secret plan not found"
        ? 404
        : 500;
    return NextResponse.json({ error: error.message || "Internal server error" }, { status });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    await SecretPlanService.deleteSecretPlan(id);
    return NextResponse.json({ message: "Secret plan deleted successfully" });
  } catch (error: any) {
    console.error("Error deleting secret plan:", error);
    const status =
      error.message === "Not authenticated"
        ? 401
        : error.message === "Secret plan not found"
        ? 404
        : 500;
    return NextResponse.json({ error: error.message || "Internal server error" }, { status });
  }
}
