import { queryStore } from './queryStore';
import { Data } from './types';

type FetchOptions<T> = {
  fetchFn?: () => Promise<T>;
  onSuccess?: (value: T) => void;
  onError?: (error: unknown) => void;
};

const createQueryClient = () => {
  const inFlightFetchFns = new Map<string, Promise<unknown>>();

  const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

  return {
    patchQuery: <T>(key: string, partial: Partial<Data<T>>) => {
      queryStore.setSnapshot(key, (prev) => ({
        ...prev,
        ...partial,
        updatedAt: Date.now(),
      }));
    },
    fetchQuery: async <T>(key: string, options?: FetchOptions<T>) => {
      const current = queryStore.getSnapshot<T>(key);
      const finalFetchFn = options?.fetchFn ?? current?.fetchFn;
      if (!finalFetchFn) return null;

      if (inFlightFetchFns.has(key)) {
        return inFlightFetchFns.get(key);
      }

      queryClient.patchQuery(key, { isLoading: true, isError: false });

      const fetchPromise = finalFetchFn()
        .then((result) => {
          queryClient.patchQuery(key, {
            data: result,
            isLoading: false,
            isError: false,
            fetchFn: finalFetchFn,
            updatedAt: Date.now(),
          });
          options?.onSuccess?.(result);
          return result;
        })
        .catch((e) => {
          queryClient.patchQuery(key, {
            data: null,
            isLoading: false,
            isError: true,
          });
          options?.onError?.(e);
          throw new Error(e);
        })
        .finally(() => {
          inFlightFetchFns.delete(key);
        });

      inFlightFetchFns.set(key, fetchPromise);
    },
    loadQuery: async <T>(
      key: string,
      staleTime: number,
      retryCount: number,
      options: FetchOptions<T>,
    ) => {
      const curSnapshot = queryStore.getSnapshot<T>(key);
      let attempt = 0;

      const shouldFetch =
        !curSnapshot?.data ||
        Date.now() - (curSnapshot?.updatedAt ?? 0) > staleTime;
      if (shouldFetch) {
        while (attempt < retryCount) {
          try {
            await queryClient.fetchQuery(key, options);
            return;
          } catch {
            await sleep(1000);
            attempt++;
          }
        }
      }
    },
    refetchQuery: async <T>(key: string, options?: FetchOptions<T>) => {
      queryClient.fetchQuery(key, options);
    },
  };
};

export const queryClient = createQueryClient();
