// app/api/secret-plan-item/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import * as SecretPlanService from "@/domains/secret-plan/service";

export const runtime = "nodejs";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { item, completed, cost, notes } = body;

    const updatedItem = await SecretPlanService.updateSecretPlanItem(id, {
      item,
      completed,
      cost,
      notes,
    });

    return NextResponse.json(updatedItem);
  } catch (error: any) {
    console.error("Error updating secret plan item:", error);
    const status =
      error.message === "Not authenticated"
        ? 401
        : error.message === "Secret plan item not found"
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

    await SecretPlanService.deleteSecretPlanItem(id);
    return NextResponse.json({ message: "Secret plan item deleted successfully" });
  } catch (error: any) {
    console.error("Error deleting secret plan item:", error);
    const status =
      error.message === "Not authenticated"
        ? 401
        : error.message === "Secret plan item not found"
        ? 404
        : 500;
    return NextResponse.json({ error: error.message || "Internal server error" }, { status });
  }
}