import { NextResponse } from "next/server";
import { clients } from "@/lib/sse-client";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const orderCode = searchParams.get("orderCode");

  if (!orderCode) {
    return NextResponse.json({ error: "orderCode is required" }, { status: 400 });
  }

  const stream = new TransformStream();
  const writer = stream.writable.getWriter();

  clients.set(orderCode, writer);

  const headers = {
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache",
    Connection: "keep-alive",
  };

  return new Response(stream.readable, { headers });
}

export async function POST(request: Request) {
  const { orderCode, data } = await request.json();

  if (!orderCode) {
    return NextResponse.json({ error: "orderCode is required" }, { status: 400 });
  }

  const writer = clients.get(orderCode);
  if (writer) {
    try {
      await writer.write(
        new TextEncoder().encode(`data: ${JSON.stringify(data || { status: "SUCCESS" })}\n\n`)
      );
      // Close the writer and remove from clients
      await writer.close();
      clients.delete(orderCode);
    } catch (error) {
      console.error("[Webhook] Error sending SSE message:", error);
      return NextResponse.json({ success: false, error: "Failed to send SSE message" }, { status: 500 });
    }
  } else {
    console.log("[Webhook] No client found for orderCode:", orderCode);
    return NextResponse.json({ success: false, error: "No client found" }, { status: 404 });
  }

  return NextResponse.json({ success: true });
}