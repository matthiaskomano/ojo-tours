import { NextRequest, NextResponse } from "next/server";
import { errorReporting } from "@/lib/error-reporting";

export async function POST(request: NextRequest) {
  try {
    const errorData = await request.json();

    // Validate required fields
    if (!errorData.message || !errorData.timestamp) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Log to console in development
    if (process.env.NODE_ENV === "development") {
      console.error("[Error Logging API]", errorData);
    }

    // In production, you would send this to your error tracking service
    // Examples: Sentry, LogRocket, DataDog, etc.
    if (process.env.NODE_ENV === "production") {
      // Example: Send to Sentry
      // if (typeof Sentry !== "undefined") {
      //   Sentry.captureException(new Error(errorData.message), {
      //     extra: errorData,
      //   });
      // }

      // Or store in database for internal review
      // await prisma.errorLog.create({
      //   data: errorData,
      // });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to log error:", error);
    return NextResponse.json(
      { error: "Failed to log error" },
      { status: 500 }
    );
  }
}
