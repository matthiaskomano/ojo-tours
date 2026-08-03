/**
 * Error Reporting Service
 * Handles error logging and reporting to external services
 */

export interface ErrorReport {
  message: string;
  stack?: string;
  componentStack?: string;
  timestamp: string;
  userAgent?: string;
  url?: string;
  userId?: string;
  severity: "low" | "medium" | "high" | "critical";
  context?: Record<string, any>;
}

class ErrorReportingService {
  private isEnabled: boolean;
  private apiEndpoint: string;

  constructor() {
    this.isEnabled = process.env.NODE_ENV === "production";
    this.apiEndpoint = "/api/errors/log";
  }

  /**
   * Log an error to the reporting service
   */
  async logError(errorReport: ErrorReport): Promise<void> {
    if (!this.isEnabled) {
      console.log("[ErrorReporting] Would log error:", errorReport);
      return;
    }

    try {
      await fetch(this.apiEndpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(errorReport),
      });
    } catch (error) {
      console.error("[ErrorReporting] Failed to log error:", error);
    }
  }

  /**
   * Create an error report from an Error object
   */
  createErrorReport(
    error: Error,
    additionalContext?: Record<string, any>
  ): ErrorReport {
    return {
      message: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString(),
      userAgent: typeof window !== "undefined" ? navigator.userAgent : undefined,
      url: typeof window !== "undefined" ? window.location.href : undefined,
      severity: this.determineSeverity(error),
      context: additionalContext,
    };
  }

  /**
   * Determine error severity based on error message
   */
  private determineSeverity(error: Error): "low" | "medium" | "high" | "critical" {
    const message = error.message.toLowerCase();

    if (message.includes("critical") || message.includes("fatal")) {
      return "critical";
    }
    if (message.includes("network") || message.includes("fetch")) {
      return "medium";
    }
    if (message.includes("auth") || message.includes("permission")) {
      return "high";
    }

    return "low";
  }

  /**
   * Log error with context
   */
  async logWithContext(
    error: Error,
    context: Record<string, any>
  ): Promise<void> {
    const report = this.createErrorReport(error, context);
    await this.logError(report);
  }

  /**
   * Log user action error
   */
  async logUserActionError(
    action: string,
    error: Error,
    userId?: string
  ): Promise<void> {
    const report = this.createErrorReport(error, {
      action,
      userId,
      type: "user_action",
    });
    await this.logError(report);
  }

  /**
   * Log API error
   */
  async logApiError(
    endpoint: string,
    error: Error,
    statusCode?: number
  ): Promise<void> {
    const report = this.createErrorReport(error, {
      endpoint,
      statusCode,
      type: "api_error",
    });
    await this.logError(report);
  }
}

// Singleton instance
export const errorReporting = new ErrorReportingService();

// Convenience functions
export const logError = (error: Error, context?: Record<string, any>) => {
  return errorReporting.logWithContext(error, context);
};

export const logUserAction = (action: string, error: Error, userId?: string) => {
  return errorReporting.logUserActionError(action, error, userId);
};

export const logApiError = (endpoint: string, error: Error, statusCode?: number) => {
  return errorReporting.logApiError(endpoint, error, statusCode);
};
