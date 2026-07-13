import { NextResponse } from "next/server";
import { getTouristNotifications } from "@/actions/touristActions";
import { requireAuth } from "@/lib/authorization";

export async function GET() {
  try {
    const user = await requireAuth();
    console.log("[tourist/notifications] Fetching for user:", user.id);
    const notifications = await getTouristNotifications();
    console.log(
      "[tourist/notifications] Returning:",
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
