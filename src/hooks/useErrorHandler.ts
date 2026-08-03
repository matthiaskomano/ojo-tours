"use client";

import { useCallback, useState } from "react";
import { toast } from "sonner";

export interface ErrorHandlingOptions {
  showToast?: boolean;
  toastMessage?: string;
  logToConsole?: boolean;
  onError?: (error: Error) => void;
}

export interface ErrorState {
  error: Error | null;
  isError: boolean;
  reset: () => void;
}

export function useErrorHandler(options: ErrorHandlingOptions = {}) {
  const {
    showToast = true,
    toastMessage,
    logToConsole = true,
    onError,
  } = options;

  const [error, setError] = useState<Error | null>(null);

  const handleError = useCallback(
    (err: unknown, customMessage?: string) => {
      const error = err instanceof Error ? err : new Error(String(err));

      if (logToConsole) {
        console.error("Error handled:", error);
      }

      if (showToast) {
        const message = customMessage || toastMessage || error.message;
        toast.error(message, {
          description: process.env.NODE_ENV === "development" ? error.stack : undefined,
        });
      }

      setError(error);
      onError?.(error);
    },
    [showToast, toastMessage, logToConsole, onError]
  );

  const reset = useCallback(() => {
    setError(null);
  }, []);

  const handleAsync = useCallback(
    async <T,>(
      asyncFn: () => Promise<T>,
      errorMessage?: string
    ): Promise<T | null> => {
      try {
        reset();
        return await asyncFn();
      } catch (err) {
        handleError(err, errorMessage);
        return null;
      }
    },
    [handleError, reset]
  );

  return {
    error,
    isError: error !== null,
    handleError,
    handleAsync,
    reset,
  };
}

// Recovery patterns
export function useRecovery() {
  const [isRecovering, setIsRecovering] = useState(false);
  const [recoveryAttempts, setRecoveryAttempts] = useState(0);

  const attemptRecovery = useCallback(
    async (recoveryFn: () => Promise<void> | void, maxAttempts = 3) => {
      if (recoveryAttempts >= maxAttempts) {
        toast.error("Recovery failed. Please contact support.");
        return false;
      }

      setIsRecovering(true);
      try {
        await recoveryFn();
        setRecoveryAttempts(0);
        toast.success("Recovery successful!");
        return true;
      } catch (error) {
        setRecoveryAttempts((prev) => prev + 1);
        toast.error(
          `Recovery attempt ${recoveryAttempts + 1} failed. Retrying...`
        );
        return false;
      } finally {
        setIsRecovering(false);
      }
    },
    [recoveryAttempts]
  );

  const resetAttempts = useCallback(() => {
    setRecoveryAttempts(0);
  }, []);

  return {
    isRecovering,
    recoveryAttempts,
    attemptRecovery,
    resetAttempts,
  };
}

// Network error handling
export function useNetworkErrorHandler() {
  const handleNetworkError = useCallback((error: Error) => {
    if (error.message.includes("fetch") || error.message.includes("network")) {
      toast.error("Network error. Please check your connection.", {
        description: "Unable to reach the server. Please check your internet connection and try again.",
        action: {
          label: "Retry",
          onClick: () => window.location.reload(),
        },
      });
    } else if (error.message.includes("timeout")) {
      toast.error("Request timeout. Please try again.", {
        description: "The request took too long. Please try again.",
      });
    } else {
      toast.error("An error occurred. Please try again.");
    }
  }, []);

  return { handleNetworkError };
}

// Form error handling
export function useFormErrorHandler() {
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const handleFieldError = useCallback((field: string, message: string) => {
    setFieldErrors((prev) => ({ ...prev, [field]: message }));
  }, []);

  const clearFieldError = useCallback((field: string) => {
    setFieldErrors((prev) => {
      const next = { ...prev };
      delete next[field];
      return next;
    });
  }, []);

  const clearAllErrors = useCallback(() => {
    setFieldErrors({});
  }, []);

  const handleFormError = useCallback((error: unknown) => {
    if (error && typeof error === "object" && "fieldErrors" in error) {
      setFieldErrors(error.fieldErrors as Record<string, string>);
      toast.error("Please fix the form errors");
    } else {
      toast.error(error instanceof Error ? error.message : "Form submission failed");
    }
  }, []);

  return {
    fieldErrors,
    handleFieldError,
    clearFieldError,
    clearAllErrors,
    handleFormError,
  };
}
