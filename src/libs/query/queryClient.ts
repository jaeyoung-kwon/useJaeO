import { queryStore } from './queryStore';
import { Query } from './types';

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
      });
    } catch {
      queryClient.patchQuery(key, {
        isLoading: false,
        isError: true,
      });
    }
  },
  loadQueryData: <TData>(key: string, queryFn: () => Promise<TData>) => {
    const snapshot = queryStore.getSnapshot(key);
    if (snapshot.data) return;

    queryClient.fetchQuery(key, queryFn);
  },
};
