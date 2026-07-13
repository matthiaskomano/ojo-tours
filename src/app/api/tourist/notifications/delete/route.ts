import { NextResponse } from "next/server";
import { deleteNotification } from "@/actions/touristActions";

export async function POST(request: Request) {
  try {
    const { id } = await request.json();
    
    if (!id) {
      return NextResponse.json(
        { error: "Notification ID is required" },
        { status: 400 }
      );
    }

    await deleteNotification(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete notification:", error);
    return NextResponse.json(
      { error: "Failed to delete notification" },
      { status: 500 }
    );
  }
}
