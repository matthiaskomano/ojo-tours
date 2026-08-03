import { useState, useCallback } from 'react';

interface OptimisticUpdateOptions<T> {
  optimisticData: T;
  updateFn: () => Promise<T>;
  onSuccess?: (data: T) => void;
  onError?: (error: Error) => void;
}

/**
 * Hook for optimistic UI updates
 * Updates the UI immediately with optimistic data, then reverts or confirms based on server response
 */
export function useOptimisticUpdate<T>() {
  const [data, setData] = useState<T | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const executeUpdate = useCallback(async ({
    optimisticData,
    updateFn,
    onSuccess,
    onError,
  }: OptimisticUpdateOptions<T>) => {
    // Set optimistic data immediately
    setData(optimisticData);
    setIsUpdating(true);
    setError(null);

    try {
      // Execute the actual update
      const result = await updateFn();
      
      // Update with actual server data
      setData(result);
      setIsUpdating(false);
      
      onSuccess?.(result);
      return result;
    } catch (err) {
      // Revert on error
      setError(err as Error);
      setIsUpdating(false);
      onError?.(err as Error);
      throw err;
    }
  }, []);

  const reset = useCallback(() => {
    setData(null);
    setError(null);
    setIsUpdating(false);
  }, []);

  return {
    data,
    isUpdating,
    error,
    executeUpdate,
    reset,
  };
}

/**
 * Hook for optimistic array updates (add, remove, update items)
 */
export function useOptimisticArray<T>(initialData: T[] = []) {
  const [data, setData] = useState<T[]>(initialData);
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const addItem = useCallback(async ({
    optimisticItem,
    addFn,
    onSuccess,
    onError,
  }: {
    optimisticItem: T;
    addFn: () => Promise<T[]>;
    onSuccess?: (items: T[]) => void;
    onError?: (error: Error) => void;
  }) => {
    // Add item optimistically
    setData(prev => [...prev, optimisticItem]);
    setIsUpdating(true);
    setError(null);

    try {
      const result = await addFn();
      setData(result);
      setIsUpdating(false);
      onSuccess?.(result);
      return result;
    } catch (err) {
      setError(err as Error);
      setIsUpdating(false);
      // Revert by removing the optimistic item
      setData(prev => prev.slice(0, -1));
      onError?.(err as Error);
      throw err;
    }
  }, []);

  const removeItem = useCallback(async ({
    itemId,
    removeFn,
    itemSelector = (item: any) => item.id,
    onSuccess,
    onError,
  }: {
    itemId: string;
    removeFn: () => Promise<T[]>;
    itemSelector?: (item: T) => string;
    onSuccess?: (items: T[]) => void;
    onError?: (error: Error) => void;
  }) => {
    // Remove item optimistically
    const previousData = [...data];
    setData(prev => prev.filter(item => itemSelector(item) !== itemId));
    setIsUpdating(true);
    setError(null);

    try {
      const result = await removeFn();
      setData(result);
      setIsUpdating(false);
      onSuccess?.(result);
      return result;
    } catch (err) {
      setError(err as Error);
      setIsUpdating(false);
      // Revert by restoring previous data
      setData(previousData);
      onError?.(err as Error);
      throw err;
    }
  }, [data]);

  const updateItem = useCallback(async ({
    itemId,
    optimisticUpdate,
    updateFn,
    itemSelector = (item: any) => item.id,
    onSuccess,
    onError,
  }: {
    itemId: string;
    optimisticUpdate: Partial<T>;
    updateFn: () => Promise<T[]>;
    itemSelector?: (item: T) => string;
    onSuccess?: (items: T[]) => void;
    onError?: (error: Error) => void;
  }) => {
    // Update item optimistically
    const previousData = [...data];
    setData(prev =>
      prev.map(item =>
        itemSelector(item) === itemId
          ? { ...item, ...optimisticUpdate }
          : item
      )
    );
    setIsUpdating(true);
    setError(null);

    try {
      const result = await updateFn();
      setData(result);
      setIsUpdating(false);
      onSuccess?.(result);
      return result;
    } catch (err) {
      setError(err as Error);
      setIsUpdating(false);
      // Revert by restoring previous data
      setData(previousData);
      onError?.(err as Error);
      throw err;
    }
  }, [data]);

  const reset = useCallback(() => {
    setData(initialData);
    setError(null);
    setIsUpdating(false);
  }, [initialData]);

  return {
    data,
    isUpdating,
    error,
    addItem,
    removeItem,
    updateItem,
    reset,
  };
}
