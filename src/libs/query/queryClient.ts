import { queryStore } from './queryStore';
import { Data } from './types';

type RefetchOptions<T> = {
  fetchFn?: () => Promise<T>;
  onSuccess?: (value: T) => void;
  onError?: (error: unknown) => void;
};

export const queryClient = {
  patchQuery: <T>(key: string, partial: Partial<Data<T>>) => {
    queryStore.setSnapshot(key, (prev) => ({ ...prev, ...partial }));
  },
  refetchQuery: async <T>(key: string, options?: RefetchOptions<T>) => {
    const current = queryStore.getSnapshot<T>(key);
    const finalFetchFn = options?.fetchFn ?? current?.fetchFn;
    if (!finalFetchFn) return null;

    queryClient.patchQuery(key, { isLoading: true, isError: false });

    try {
      const result = await finalFetchFn();
      queryClient.patchQuery(key, {
        data: result,
        isLoading: false,
        isError: false,
        fetchFn: finalFetchFn,
      });
      options?.onSuccess?.(result);
      return result;
    } catch (e) {
      queryClient.patchQuery(key, {
        data: null,
        isLoading: false,
        isError: true,
      });
      options?.onError?.(e);
      return null;
    }
  },
};
