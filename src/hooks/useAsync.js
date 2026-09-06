/**
 * Minimal async-data hook that mirrors the TanStack Query surface
 * ({ data, isLoading, isError, error, refetch }). The whole app consumes THIS shape,
 * so migrating to TanStack Query later is a hook-body change, not a screen change.
 */

import { useCallback, useEffect, useRef, useState } from 'react';

export function useAsync(fn, deps = [], { enabled = true, initialData = null } = {}) {
  const [data, setData] = useState(initialData);
  const [isLoading, setIsLoading] = useState(enabled);
  const [error, setError] = useState(null);
  const mounted = useRef(true);
  const reqId = useRef(0);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const memoFn = useCallback(fn, deps);

  const run = useCallback(async () => {
    const id = ++reqId.current;
    setIsLoading(true);
    setError(null);
    try {
      const result = await memoFn();
      if (mounted.current && id === reqId.current) setData(result);
    } catch (e) {
      if (mounted.current && id === reqId.current) setError(e);
    } finally {
      if (mounted.current && id === reqId.current) setIsLoading(false);
    }
  }, [memoFn]);

  useEffect(() => {
    mounted.current = true;
    if (enabled) run();
    else setIsLoading(false);
    return () => {
      mounted.current = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [run, enabled]);

  return { data, isLoading, isError: !!error, error, refetch: run, setData };
}
