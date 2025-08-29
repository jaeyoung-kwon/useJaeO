import { useCallback, useEffect, useRef, useSyncExternalStore } from 'react';
import { queryClient } from './query/queryClient';
import { queryStore } from './query/queryStore';

interface UseQueryOptions<TData> {
  queryKey: string;
  queryFn: () => Promise<TData>;
  staleTime?: number;
  gcTime?: number;
  retry?: number;
}

export const useQuery = <TData>({
  queryKey,
  queryFn,
  staleTime = 0,
  gcTime = 5 * 60 * 1000, // 5분
  retry = 3,
}: UseQueryOptions<TData>) => {
  const queryFnRef = useRef(queryFn);

  const snapshot = useSyncExternalStore(
    useCallback(
      (onStoreChange) => {
        const unsubscribe = queryStore.subscribe(
          queryKey,
          onStoreChange,
          gcTime,
        );
        queryClient.loadQueryData(
          queryKey,
          queryFnRef.current,
          staleTime,
          retry,
        );
        return unsubscribe;
      },
      [gcTime, queryKey, retry, staleTime],
    ),
    () => queryStore.getSnapshot<TData>(queryKey),
    () => queryStore.getSnapshot<TData>(queryKey),
  );

  useEffect(() => {
    queryFnRef.current = queryFn;
  }, [queryFn]);

  return snapshot;
};
