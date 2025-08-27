import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useSyncExternalStore,
} from 'react';
import { queryClient } from './query/queryClient';
import { queryStore } from './query/queryStore';

interface UseJaeOOptions<T, R = T> {
  fetchKey: string;
  fetchFn: () => Promise<T>;
  convertFn?: (raw: T) => R;
  onError?: () => void;
  onSuccess?: () => void;
  staleTime?: number;
  gcTime?: number;
}

export function useJaeO<T, R = T>({
  fetchKey,
  fetchFn,
  convertFn,
  onError,
  onSuccess,
  staleTime = 0,
  gcTime = 3000,
}: UseJaeOOptions<T, R>) {
  const fetchFnRef = useRef(fetchFn);
  const convertFnRef = useRef(convertFn);
  const onErrorRef = useRef(onError);
  const onSuccessRef = useRef(onSuccess);

  const fetchOptions = useMemo(
    () => ({
      fetchFn: fetchFnRef.current,
      onError: onErrorRef.current,
      onSuccess: onSuccessRef.current,
    }),
    [],
  );

  const snapshot = useSyncExternalStore(
    useCallback(
      (onStoreChange) => {
        const unsubscribe = queryStore.subscribe(
          fetchKey,
          onStoreChange,
          gcTime,
        );

        queryClient.loadQuery(fetchKey, staleTime, fetchOptions);

        return unsubscribe;
      },
      [fetchKey, fetchOptions, staleTime, gcTime],
    ),
    () => queryStore.getSnapshot<T>(fetchKey),
    () => queryStore.getSnapshot<T>(fetchKey),
  );

  useEffect(() => {
    fetchFnRef.current = fetchFn;
  }, [fetchFn]);

  useEffect(() => {
    convertFnRef.current = convertFn;
  }, [convertFn]);

  useEffect(() => {
    onErrorRef.current = onError;
  }, [onError]);

  useEffect(() => {
    onSuccessRef.current = onSuccess;
  }, [onSuccess]);

  const convertedData = useMemo(
    () =>
      snapshot && snapshot.data !== null && snapshot.data !== undefined
        ? (convertFnRef.current?.(snapshot.data) ??
          (snapshot.data as unknown as R))
        : null,
    [snapshot],
  );

  return {
    data: convertedData,
    isLoading: snapshot?.isLoading ?? false,
    isError: snapshot?.isError ?? false,
    refetch: queryClient.refetchQuery,
  };
}
