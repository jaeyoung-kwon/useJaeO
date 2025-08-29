import { queryStore } from './queryStore';
import { Query } from './types';

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export const queryClient = {
  patchQuery: <TData>(key: string, partial: Partial<Query<TData>>) => {
    queryStore.setSnapshot(key, (prev) => ({ ...prev, ...partial }));
  },
  fetchQuery: async <TData>(key: string, queryFn: () => Promise<TData>) => {
    queryClient.patchQuery<TData>(key, { isLoading: true, isError: false });
    try {
      const result = await queryFn();
      queryClient.patchQuery(key, {
        data: result,
        isLoading: false,
        isError: false,
        updatedAt: Date.now(),
      });
    } catch (e) {
      queryClient.patchQuery(key, {
        isLoading: false,
        isError: true,
      });
      throw new Error(e);
    }
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
