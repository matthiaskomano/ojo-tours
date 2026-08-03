"use client";

import React, { Component, ErrorInfo, ReactNode } from "react";
import { AlertOctagon, RefreshCw, Home, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorInfo: null,
    };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({
      error,
      errorInfo,
    });

    // Log error to console
    console.error("Error caught by boundary:", error, errorInfo);

    // Log error reporting service (in production)
    if (typeof window !== "undefined" && process.env.NODE_ENV === "production") {
      this.logErrorToService(error, errorInfo);
    }
  }

  private logErrorToService = (error: Error, errorInfo: ErrorInfo) => {
    // In production, send to error reporting service
    // Example: Sentry, LogRocket, or custom endpoint
    try {
      const errorData = {
        message: error.message,
        stack: error.stack,
        componentStack: errorInfo.componentStack,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        url: window.location.href,
      };

      // Send to error logging endpoint
      fetch("/api/errors/log", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(errorData),
      }).catch((e) => console.error("Failed to log error:", e));
    } catch (e) {
      console.error("Error logging failed:", e);
    }
  };

  private handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  private handleGoHome = () => {
    window.location.href = "/";
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen flex items-center justify-center bg-[#0A1A12] p-4">
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
                  We apologize for the inconvenience. An unexpected error has
                  occurred.
                </p>
              </div>

              {/* Error Details (Development Only) */}
              {process.env.NODE_ENV === "development" && this.state.error && (
                <div className="w-full text-left">
                  <details className="group">
                    <summary className="cursor-pointer text-sm text-gray-500 hover:text-gray-300">
                      View error details
                    </summary>
                    <div className="mt-4 space-y-2 rounded-lg bg-black/30 p-4 text-xs">
                      <div className="text-red-400 font-mono">
                        {this.state.error.toString()}
                      </div>
                      {this.state.errorInfo && (
                        <pre className="mt-2 text-gray-400 overflow-x-auto">
                          {this.state.errorInfo.componentStack}
                        </pre>
                      )}
                    </div>
                  </details>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 w-full">
                <Button
                  onClick={this.handleReset}
                  variant="default"
                  className="flex-1"
                >
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Try Again
                </Button>
                <Button
                  onClick={this.handleGoHome}
                  variant="outline"
                  className="flex-1"
                >
                  <Home className="mr-2 h-4 w-4" />
                  Go Home
                </Button>
              </div>

              {/* Contact Support */}
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Mail className="h-4 w-4" />
                <span>
                  Need help? Contact{" "}
                  <a
                    href="mailto:support@ojotours.com"
                    className="text-amber-500 hover:text-amber-400 underline"
                  >
                    support@ojotours.com
                  </a>
                </span>
              </div>
            </div>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}
