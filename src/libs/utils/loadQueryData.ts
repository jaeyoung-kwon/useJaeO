import { getSnapshot, updateQuery } from '../QueryStore';

async function fetchAndUpdateQueryData<TData>(
  key: string,
  queryFn: () => Promise<TData>,
) {
  try {
    const result = await queryFn();
    updateQuery(key, {
      data: result,
      isLoading: false,
      isError: false,
    });
  } catch {
    updateQuery(key, {
      data: null,
      isLoading: false,
      isError: true,
    });
  }
}

export async function loadQueryData<TData>(
  key: string,
  queryFn: () => Promise<TData>,
) {
  const snapshot = getSnapshot(key);
  if (snapshot.data) return;

  await fetchAndUpdateQueryData(key, queryFn);
}
