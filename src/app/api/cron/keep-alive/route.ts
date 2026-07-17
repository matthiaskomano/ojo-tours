import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * Database Keep-Alive Endpoint
 * 
 * This endpoint is called by Vercel Cron Jobs every 5 days to prevent
 * the Supabase database from being paused due to inactivity.
 * 
 * It executes a lightweight read-only query to maintain database connectivity.
 * 
 * Security: Protected by Vercel's cron authorization header
 * Schedule: Every 5 days (configured in vercel.json)
 */

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

interface KeepAliveResponse {
  status: "success" | "error";
  timestamp: string;
  duration: number;
  databaseStatus: "connected" | "error";
  message: string;
  error?: string;
}

export async function GET(request: Request) {
  const startTime = Date.now();
  const timestamp = new Date().toISOString();

  // Verify this is being called by Vercel Cron
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;
  
  // If CRON_SECRET is set, verify the authorization header
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    console.error("[Keep-Alive] Unauthorized access attempt");
    return NextResponse.json(
      {
        status: "error",
        timestamp,
        duration: Date.now() - startTime,
        databaseStatus: "error",
        message: "Unauthorized",
        error: "Invalid authorization header",
      } as KeepAliveResponse,
      { status: 401 }
    );
  }

  try {
    console.log("[Keep-Alive] Starting database keep-alive check");

    // Execute a lightweight read-only query
    // Using Settings table as it's lightweight and always exists
    const settingsCount = await prisma.settings.count();
    
    const duration = Date.now() - startTime;
    
    const response: KeepAliveResponse = {
      status: "success",
      timestamp,
      duration,
      databaseStatus: "connected",
      message: `Database keep-alive successful. Settings count: ${settingsCount}`,
    };

    console.log("[Keep-Alive]", JSON.stringify(response));

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    const duration = Date.now() - startTime;
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    
    const errorResponse: KeepAliveResponse = {
      status: "error",
      timestamp,
      duration,
      databaseStatus: "error",
      message: "Database keep-alive failed",
      error: errorMessage,
    };

    console.error("[Keep-Alive]", JSON.stringify(errorResponse));

    // Return error response without throwing to prevent cron job failures
    return NextResponse.json(errorResponse, { status: 500 });
  }
}
