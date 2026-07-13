import { NextResponse } from "next/server";
import { markAllNotificationsRead } from "@/actions/touristActions";

export async function POST() {
  try {
    await markAllNotificationsRead();
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to mark all notifications as read:", error);
    return NextResponse.json(
      { error: "Failed to mark all notifications as read" },
      { status: 500 }
    );
  }
}
