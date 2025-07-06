import { useState, useEffect } from 'react';
import { usePowerSync } from '@/components/providers/SystemProvider';

interface UseQueryOptions {
  enabled?: boolean;
}

interface UseQueryResult<T> {
  data: T[] | undefined;
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
}

export function useQuery<T = any>(
  query: string,
  parameters: any[] = [],
  options: UseQueryOptions = {}
): UseQueryResult<T> {
  const [data, setData] = useState<T[] | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const powerSync = usePowerSync();
  const { enabled = true } = options;

  const executeQuery = async () => {
    if (!powerSync || !enabled) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const result = await powerSync.getAll(query, parameters);
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Query failed'));
      console.error('Query error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const refetch = () => {
    executeQuery();
  };

  useEffect(() => {
    executeQuery();
  }, [powerSync, query, JSON.stringify(parameters), enabled]);

  // Set up real-time updates by watching for changes
  useEffect(() => {
    if (!powerSync || !enabled) return;

    const watchQuery = async () => {
      try {
        const stream = powerSync.watch(query, parameters);

        for await (const result of stream) {
          setData(result.rows._array || result.rows);
        }
      } catch (err) {
        console.error('Watch query error:', err);
      }
    };

    watchQuery();
  }, [powerSync, query, JSON.stringify(parameters), enabled]);

  return {
    data,
    isLoading,
    error,
    refetch,
  };
}
