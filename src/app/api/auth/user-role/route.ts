import { NextResponse } from "next/server";
import { getCurrentUserWithRole } from "@/lib/auth";

export async function GET() {
  try {
    const user = await getCurrentUserWithRole();

    if (!user) {
      console.log("[user-role] No user found, returning default");
      return NextResponse.json({ role: "TOURIST", userId: null });
    }

    const response = {
      role: user.role?.name || "TOURIST",
      userId: user.id, // Return database user ID
    };
    console.log("[user-role] Returning user data:", response);
    return NextResponse.json(response);
  } catch (error) {
    console.error("Failed to fetch user role:", error);
    return NextResponse.json({ role: "TOURIST", userId: null });
  }
}
