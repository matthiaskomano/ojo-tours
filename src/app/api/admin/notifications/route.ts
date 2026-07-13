import { NextResponse } from "next/server";
import { getAllNotifications } from "@/actions/adminActions";
import { requireAuth } from "@/lib/authorization";

export async function GET() {
  try {
    const user = await requireAuth();
    console.log(
      "[admin/notifications] Fetching all notifications for user:",
      user.id,
    );
    const notifications = await getAllNotifications();
    console.log(
      "[admin/notifications] Returning:",
      notifications.length,
      "notifications",
    );
    return NextResponse.json(notifications);
  } catch (error) {
    console.error("Failed to fetch notifications:", error);
    return NextResponse.json(
      { error: "Failed to fetch notifications" },
      { status: 500 },
    );
  }
}
