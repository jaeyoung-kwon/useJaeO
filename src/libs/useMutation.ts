import { useCallback } from 'react';

interface UseMutationOptions<TVariable, TData> {
  mutationFn: (variables: TVariable) => Promise<TData>;
  onSuccess?: (result: TData) => void;
  onError?: () => void;
}

export function useMutation<TVariable, TData>({
  mutationFn,
  onSuccess,
  onError,
}: UseMutationOptions<TVariable, TData>) {
  const mutate = useCallback(
    async (variables: TVariable) => {
      try {
        const result = await mutationFn(variables);
        onSuccess?.(result);

        return result;
      } catch (error) {
        onError?.();

        throw error;
      }
    },
    [mutationFn, onSuccess, onError],
  );

  return { mutate };
}
