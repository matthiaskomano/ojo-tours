import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";

interface ProgressIndicatorProps {
  progress: number;
  status: string;
  isComplete?: boolean;
  isError?: boolean;
  className?: string;
}

/**
 * Progress indicator with status text and visual feedback
 */
export function ProgressIndicator({
  progress,
  status,
  isComplete,
  isError,
  className,
}: ProgressIndicatorProps) {
  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">{status}</span>
        <span className="font-medium">{Math.round(progress)}%</span>
      </div>
      <Progress value={progress} className="h-2" />
      {isComplete && !isError && (
        <div className="flex items-center gap-2 text-sm text-green-600">
          <CheckCircle className="h-4 w-4" />
          <span>Operation completed successfully</span>
        </div>
      )}
      {isError && (
        <div className="flex items-center gap-2 text-sm text-red-600">
          <XCircle className="h-4 w-4" />
          <span>Operation failed</span>
        </div>
      )}
    </div>
  );
}

/**
 * Compact progress bar for inline use
 */
export function CompactProgress({
  progress,
  className,
}: {
  progress: number;
  className?: string;
}) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <Loader2 className="h-3 w-3 animate-spin text-primary" />
      <Progress value={progress} className="h-1 flex-1" />
      <span className="text-xs text-muted-foreground">{Math.round(progress)}%</span>
    </div>
  );
}

/**
 * Step progress indicator for multi-step operations
 */
interface StepProgressProps {
  steps: string[];
  currentStep: number;
  completedSteps?: number[];
  className?: string;
}

export function StepProgress({
  steps,
  currentStep,
  completedSteps = [],
  className,
}: StepProgressProps) {
  return (
    <div className={cn("space-y-4", className)}>
      <div className="flex items-center justify-between">
        {steps.map((step, index) => {
          const isCompleted = completedSteps.includes(index);
          const isCurrent = index === currentStep;
          const isPending = index > currentStep;

          return (
            <div key={index} className="flex-1 flex items-center">
              <div className="flex flex-col items-center flex-1">
                <div
                  className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors",
                    isCompleted && "bg-green-500 text-white",
                    isCurrent && "bg-primary text-primary-foreground",
                    isPending && "bg-muted text-muted-foreground"
                  )}
                >
                  {isCompleted ? (
                    <CheckCircle className="h-4 w-4" />
                  ) : (
                    index + 1
                  )}
                </div>
                <span
                  className={cn(
                    "text-xs mt-2 text-center",
                    isCurrent && "font-medium text-primary",
                    isPending && "text-muted-foreground"
                  )}
                >
                  {step}
                </span>
              </div>
              {index < steps.length - 1 && (
                <div
                  className={cn(
                    "flex-1 h-0.5 mx-2 transition-colors",
                    isCompleted ? "bg-green-500" : "bg-muted"
                  )}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
