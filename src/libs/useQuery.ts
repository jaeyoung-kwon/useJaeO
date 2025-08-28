import { useCallback, useSyncExternalStore } from 'react';
import { getSnapshot, subscribe } from './QueryStore';
import { loadQueryData } from './utils/loadQueryData';

interface UseQueryOptions<TData> {
  queryKey: string;
  queryFn: () => Promise<TData>;
}

export const useQuery = <TData>({
  queryKey,
  queryFn,
}: UseQueryOptions<TData>) => {
  const snapshot = useSyncExternalStore(
    useCallback(
      (onStoreChange) => {
        const unsubscribe = subscribe(queryKey, onStoreChange);
        loadQueryData(queryKey, queryFn);
        return unsubscribe;
      },
      [queryKey, queryFn],
    ),
    () => getSnapshot<TData>(queryKey),
  );

  return snapshot;
};
