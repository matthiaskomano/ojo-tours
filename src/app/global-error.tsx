"use client";

import { useEffect } from "react";
import { AlertOctagon, RefreshCw, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log error to error reporting service
    console.error("Global error:", error);
  }, [error]);

  return (
    <html>
      <body className="min-h-screen flex items-center justify-center bg-[#0A1A12] p-4">
        <Card className="max-w-2xl w-full p-8 bg-[#1A2A22] border-[#2A3A32]">
          <div className="flex flex-col items-center text-center space-y-6">
            {/* Error Icon */}
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-red-500/10">
              <AlertOctagon className="h-10 w-10 text-red-500" />
            </div>

            {/* Error Message */}
            <div className="space-y-2">
              <h1 className="text-2xl font-bold text-white">
                Something went wrong
              </h1>
              <p className="text-gray-400">
                A critical error has occurred. Our team has been notified and is
                working to fix this issue.
              </p>
            </div>

            {/* Error Details (Development Only) */}
            {process.env.NODE_ENV === "development" && (
              <div className="w-full text-left">
                <details className="group">
                  <summary className="cursor-pointer text-sm text-gray-500 hover:text-gray-300">
                    View error details
                  </summary>
                  <div className="mt-4 space-y-2 rounded-lg bg-black/30 p-4 text-xs">
                    <div className="text-red-400 font-mono">
                      {error.message}
                    </div>
                    {error.digest && (
                      <div className="text-gray-400 font-mono">
                        Digest: {error.digest}
                      </div>
                    )}
                    <div className="text-gray-400 font-mono whitespace-pre-wrap">
                      {error.stack}
                    </div>
                  </div>
                </details>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 w-full">
              <Button
                onClick={() => reset()}
                variant="default"
                className="flex-1"
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                Try Again
              </Button>
              <Button
                onClick={() => (window.location.href = "/")}
                variant="outline"
                className="flex-1"
              >
                <Home className="mr-2 h-4 w-4" />
                Go Home
              </Button>
            </div>

            {/* Contact Support */}
            <div className="text-sm text-gray-500">
              Need help? Contact{" "}
              <a
                href="mailto:support@ojotours.com"
                className="text-amber-500 hover:text-amber-400 underline"
              >
                support@ojotours.com
              </a>
            </div>
          </div>
        </Card>
      </body>
    </html>
  );
}
