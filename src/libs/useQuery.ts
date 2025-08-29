import { useCallback, useEffect, useRef, useSyncExternalStore } from 'react';
import { queryClient } from './query/queryClient';
import { queryStore } from './query/queryStore';

interface UseQueryOptions<TData> {
  queryKey: string;
  queryFn: () => Promise<TData>;
}

export const useQuery = <TData>({
  queryKey,
  queryFn,
}: UseQueryOptions<TData>) => {
  const queryFnRef = useRef(queryFn);

  const snapshot = useSyncExternalStore(
    useCallback(
      (onStoreChange) => {
        const unsubscribe = queryStore.subscribe(queryKey, onStoreChange);
        queryClient.loadQueryData(queryKey, queryFnRef.current);
        return unsubscribe;
      },
      [queryKey],
    ),
    () => queryStore.getSnapshot<TData>(queryKey),
    () => queryStore.getSnapshot<TData>(queryKey),
  );

  useEffect(() => {
    queryFnRef.current = queryFn;
  }, [queryFn]);

  return snapshot;
};
