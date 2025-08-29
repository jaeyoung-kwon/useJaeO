import { queryStore } from './queryStore';
import { Query } from './types';

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

const createQueryClient = () => {
  const inFlightFetchFns = new Map<string, Promise<unknown>>();

  return {
    patchQuery: <TData>(key: string, partial: Partial<Query<TData>>) => {
      queryStore.setSnapshot(key, (prev) => ({ ...prev, ...partial }));
    },
    fetchQuery: async <TData>(key: string, queryFn: () => Promise<TData>) => {
      if (inFlightFetchFns.has(key)) {
        return inFlightFetchFns.get(key);
      }

      queryClient.patchQuery<TData>(key, { isLoading: true, isError: false });

      const fetchPromise = queryFn()
        .then((result) => {
          queryClient.patchQuery(key, {
            data: result,
            isLoading: false,
            isError: false,
            updatedAt: Date.now(),
          });
        })
        .catch((error) => {
          queryClient.patchQuery(key, {
            isLoading: false,
            isError: true,
          });
          throw error instanceof Error ? error : new Error(String(error));
        })
        .finally(() => {
          inFlightFetchFns.delete(key);
        });

      inFlightFetchFns.set(key, fetchPromise);
    },
    loadQueryData: async <TData>(
      key: string,
      queryFn: () => Promise<TData>,
      staleTime: number,
      retryCount: number,
    ) => {
      let attempt = 0;

      const snapshot = queryStore.getSnapshot(key);
      const isStale =
        !snapshot.updatedAt || Date.now() - snapshot.updatedAt > staleTime;

      if (snapshot.data == null || isStale) {
        while (attempt < retryCount) {
          try {
            await queryClient.fetchQuery(key, queryFn);
            return;
          } catch {
            await sleep(1000);
            attempt++;
          }
        }
      }
    },
  };
};

export const queryClient = createQueryClient();
