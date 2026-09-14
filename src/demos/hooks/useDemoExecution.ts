import { useState, useCallback } from 'react';
import type { DemoResult } from '../types';

function serializeError(value: unknown): string {
  const seen = new WeakSet<object>();
  try {
    return JSON.stringify(value, (_key, item) => {
      if (typeof item === 'bigint') return item.toString();
      if (typeof item === 'object' && item !== null) {
        if (seen.has(item)) return '[Circular]';
        seen.add(item);
        if (item instanceof Error) {
          return {
            name: item.name,
            message: item.message,
            ...(item.cause === undefined ? {} : { cause: item.cause }),
            ...Object.fromEntries(Object.entries(item)),
          };
        }
      }
      return item;
    }, 2);
  } catch {
    return String(value);
  }
}

export function formatDemoError(error: unknown): string {
  if (typeof error === 'string') return error;
  if (error instanceof Error && error.message) {
    const details = Object.entries(error).length ? serializeError(error) : '';
    return details ? `${error.message}\n\nDetails:\n${details}` : error.message;
  }
  if (error && typeof error === 'object') return serializeError(error);
  return String(error);
}

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
      const error = formatDemoError(e);
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
