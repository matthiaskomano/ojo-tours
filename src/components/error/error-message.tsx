"use client";

import React from "react";
import {
  AlertOctagon,
  AlertTriangle,
  Info,
  XCircle,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export type ErrorSeverity = "error" | "warning" | "info";

export interface ErrorDisplayProps {
  title?: string;
  message: string;
  severity?: ErrorSeverity;
  onRetry?: () => void;
  onDismiss?: () => void;
  showIcon?: boolean;
  className?: string;
}

const errorIcons = {
  error: AlertOctagon,
  warning: AlertTriangle,
  info: Info,
};

const errorColors = {
  error: {
    bg: "bg-red-500/10",
    border: "border-red-500/20",
    icon: "text-red-500",
    title: "text-red-400",
  },
  warning: {
    bg: "bg-amber-500/10",
    border: "border-amber-500/20",
    icon: "text-amber-500",
    title: "text-amber-400",
  },
  info: {
    bg: "bg-blue-500/10",
    border: "border-blue-500/20",
    icon: "text-blue-500",
    title: "text-blue-400",
  },
};

export function ErrorDisplay({
  title,
  message,
  severity = "error",
  onRetry,
  onDismiss,
  showIcon = true,
  className = "",
}: ErrorDisplayProps) {
  const Icon = errorIcons[severity];
  const colors = errorColors[severity];

  const defaultTitle = {
    error: "Error",
    warning: "Warning",
    info: "Information",
  }[severity];

  return (
    <Card className={`${colors.bg} ${colors.border} border p-4 ${className}`}>
      <div className="flex items-start gap-3">
        {showIcon && (
          <div className={`shrink-0 ${colors.icon}`}>
            <Icon className="h-5 w-5" />
          </div>
        )}
        <div className="flex-1 min-w-0">
          {title && (
            <h3 className={`font-semibold ${colors.title} mb-1`}>{title}</h3>
          )}
          <p className="text-sm text-gray-300">{message}</p>
          {(onRetry || onDismiss) && (
            <div className="flex gap-2 mt-3">
              {onRetry && (
                <Button
                  onClick={onRetry}
                  variant="outline"
                  size="sm"
                  className="h-8 text-xs"
                >
                  <RefreshCw className="mr-1 h-3 w-3" />
                  Retry
                </Button>
              )}
              {onDismiss && (
                <Button
                  onClick={onDismiss}
                  variant="ghost"
                  size="sm"
                  className="h-8 text-xs"
                >
                  Dismiss
                </Button>
              )}
            </div>
          )}
        </div>
        {onDismiss && (
          <button
            onClick={onDismiss}
            className={`shrink-0 ${colors.icon} hover:opacity-70 transition-opacity`}
          >
            <XCircle className="h-5 w-5" />
          </button>
        )}
      </div>
    </Card>
  );
}

// Inline error message for forms
export interface FormErrorProps {
  message: string;
  className?: string;
}

export function FormError({ message, className = "" }: FormErrorProps) {
  return (
    <div
      className={`flex items-center gap-2 text-red-400 text-sm mt-1 ${className}`}
    >
      <XCircle className="h-4 w-4 shrink-0" />
      <span>{message}</span>
    </div>
  );
}

// Inline warning message
export interface FormWarningProps {
  message: string;
  className?: string;
}

export function FormWarning({ message, className = "" }: FormWarningProps) {
  return (
    <div
      className={`flex items-center gap-2 text-amber-400 text-sm mt-1 ${className}`}
    >
      <AlertTriangle className="h-4 w-4 shrink-0" />
      <span>{message}</span>
    </div>
  );
}

// Full-page error display
export interface FullPageErrorProps {
  title?: string;
  message: string;
  onRetry?: () => void;
  onGoHome?: () => void;
  showIcon?: boolean;
}

export function FullPageError({
  title = "Something went wrong",
  message,
  onRetry,
  onGoHome,
  showIcon = true,
}: FullPageErrorProps) {
  const handleGoHome = () => {
    if (onGoHome) {
      onGoHome();
    } else {
      window.location.href = "/";
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0A1A12] p-4">
      <Card className="max-w-md w-full p-8 bg-[#1A2A22] border-[#2A3A32]">
        <div className="flex flex-col items-center text-center space-y-6">
          {showIcon && (
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-500/10">
              <AlertOctagon className="h-8 w-8 text-red-500" />
            </div>
          )}

          <div className="space-y-2">
            <h1 className="text-xl font-bold text-white">{title}</h1>
            <p className="text-gray-400 text-sm">{message}</p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 w-full">
            {onRetry && (
              <Button onClick={onRetry} variant="default" className="flex-1">
                <RefreshCw className="mr-2 h-4 w-4" />
                Try Again
              </Button>
            )}
            <Button onClick={handleGoHome} variant="outline" className="flex-1">
              Go Home
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
