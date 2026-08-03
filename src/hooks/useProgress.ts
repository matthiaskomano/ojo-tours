import { useState, useCallback } from "react";

interface ProgressState {
  progress: number;
  status: string;
  isComplete: boolean;
  isError: boolean;
}

/**
 * Hook for tracking progress of long-running operations
 */
export function useProgress() {
  const [state, setState] = useState<ProgressState>({
    progress: 0,
    status: "Initializing...",
    isComplete: false,
    isError: false,
  });

  const startProgress = useCallback((initialStatus = "Starting...") => {
    setState({
      progress: 0,
      status: initialStatus,
      isComplete: false,
      isError: false,
    });
  }, []);

  const updateProgress = useCallback((progress: number, status?: string) => {
    setState((prev) => ({
      ...prev,
      progress: Math.min(100, Math.max(0, progress)),
      status: status || prev.status,
    }));
  }, []);

  const incrementProgress = useCallback((amount = 10, status?: string) => {
    setState((prev) => ({
      ...prev,
      progress: Math.min(100, prev.progress + amount),
      status: status || prev.status,
    }));
  }, []);

  const completeProgress = useCallback((status = "Complete!") => {
    setState({
      progress: 100,
      status,
      isComplete: true,
      isError: false,
    });
  }, []);

  const errorProgress = useCallback((status = "Error occurred") => {
    setState((prev) => ({
      ...prev,
      status,
      isError: true,
    }));
  }, []);

  const resetProgress = useCallback(() => {
    setState({
      progress: 0,
      status: "Initializing...",
      isComplete: false,
      isError: false,
    });
  }, []);

  return {
    ...state,
    startProgress,
    updateProgress,
    incrementProgress,
    completeProgress,
    errorProgress,
    resetProgress,
  };
}

/**
 * Hook for tracking batch operations with progress
 */
export function useBatchProgress<T>(items: T[]) {
  const [state, setState] = useState<ProgressState>({
    progress: 0,
    status: "Preparing...",
    isComplete: false,
    isError: false,
  });

  const [processedItems, setProcessedItems] = useState<Set<string>>(new Set());
  const [failedItems, setFailedItems] = useState<Set<string>>(new Set());

  const startBatch = useCallback((status = "Starting batch operation...") => {
    setState({
      progress: 0,
      status,
      isComplete: false,
      isError: false,
    });
    setProcessedItems(new Set());
    setFailedItems(new Set());
  }, []);

  const markItemProcessed = useCallback(
    (itemId: string, status?: string) => {
      setProcessedItems((prev) => new Set(prev).add(itemId));
      setState((prev) => {
        const newProgress = ((processedItems.size + 1) / items.length) * 100;
        return {
          ...prev,
          progress: newProgress,
          status:
            status ||
            `Processed ${processedItems.size + 1} of ${items.length} items...`,
        };
      });
    },
    [items.length, processedItems.size],
  );

  const markItemFailed = useCallback((itemId: string, status?: string) => {
    setFailedItems((prev) => new Set(prev).add(itemId));
    setState((prev) => ({
      ...prev,
      status: status || `Failed to process item ${itemId}`,
    }));
  }, []);

  const completeBatch = useCallback(
    (status = "Batch operation complete!") => {
      setState({
        progress: 100,
        status,
        isComplete: true,
        isError: failedItems.size > 0,
      });
    },
    [failedItems.size],
  );

  const errorBatch = useCallback((status = "Batch operation failed") => {
    setState((prev) => ({
      ...prev,
      status,
      isError: true,
    }));
  }, []);

  const resetBatch = useCallback(() => {
    setState({
      progress: 0,
      status: "Preparing...",
      isComplete: false,
      isError: false,
    });
    setProcessedItems(new Set());
    setFailedItems(new Set());
  }, []);

  return {
    ...state,
    processedItems,
    failedItems,
    isUpdating: !state.isComplete && state.progress > 0,
    startBatch,
    markItemProcessed,
    markItemFailed,
    completeBatch,
    errorBatch,
    resetBatch,
  };
}
