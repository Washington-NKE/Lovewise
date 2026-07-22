// app/api/messages/route.ts
import { NextRequest, NextResponse } from "next/server";
import * as MessageService from "@/domains/message/service";

export async function GET() {
  try {
    const messages = await MessageService.getMessages();
    return NextResponse.json(messages);
  } catch (error: any) {
    console.error("Error fetching messages:", error);
    const status = error.message === "Not authenticated" ? 401 : 500;
    return NextResponse.json({ error: error.message || "Internal server error" }, { status });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { content, attachments } = await req.json();

    if (!content) {
      return NextResponse.json({ error: "Content is required" }, { status: 400 });
    }

    const message = await MessageService.sendMessage(content, attachments);
    return NextResponse.json(message, { status: 201 });
  } catch (error: any) {
    console.error("Error sending message:", error);
    const status =
      error.message === "Not authenticated"
        ? 401
        : error.message === "No active relationship found"
        ? 400
        : 500;
    return NextResponse.json({ error: error.message || "Internal server error" }, { status });
  }
}