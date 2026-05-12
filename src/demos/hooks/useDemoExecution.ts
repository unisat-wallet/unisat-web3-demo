import { useState, useCallback } from 'react';
import type { DemoResult } from '../types';

/**
 * Hook for managing demo execution state
 */
export function useDemoExecution() {
  const [result, setResult] = useState<DemoResult>({ status: 'idle' });

  const execute = useCallback(async <T>(
    fn: () => Promise<T>,
    formatResult?: (data: T) => string
  ) => {
    setResult({ status: 'loading' });
    try {
      const data = await fn();
      const formatted = formatResult ? formatResult(data) : String(data);
      setResult({ status: 'success', data: formatted });
      return data;
    } catch (e) {
      const error = e instanceof Error ? e.message : String(e);
      setResult({ status: 'error', error });
      throw e;
    }
  }, []);

  const reset = useCallback(() => {
    setResult({ status: 'idle' });
  }, []);

  return { result, execute, reset, isLoading: result.status === 'loading' };
}

/**
 * Get unisat provider from window
 */
export function getUnisat() {
  const unisat = (window as any).unisat;
  if (!unisat) {
    throw new Error('UniSat wallet not found');
  }
  return unisat;
}
