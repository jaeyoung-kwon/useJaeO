import { Listener, Query } from './types';

type Store<TData> = Map<string, Query<TData>>;

const initState = (): Query<unknown> => ({
  data: null,
  isLoading: true,
  isError: false,
});

export interface QueryStore {
  getSnapshot: <TData>(key: string) => Query<TData>;
  setSnapshot: <TData>(
    key: string,
    next: Query<TData> | ((prev: Query<TData>) => Query<TData>),
  ) => void;
  subscribe: (key: string, callback: Listener) => () => void;
}

export const createQueryStore = (): QueryStore => {
  const store: Store<unknown> = new Map<string, Query<unknown>>();
  const listeners: Record<string, Set<Listener>> = {};

  const getOrInit = <TData>(key: string): Query<TData> => {
    const cur = store.get(key) as Query<TData> | undefined;
    if (cur) return cur;

    const next = initState();
    store.set(key, next);
    return next as Query<TData>;
  };

  return {
    getSnapshot: <TData>(key: string) => getOrInit<TData>(key),
    setSnapshot: <TData>(
      key: string,
      next: Query<TData> | ((prev: Query<TData>) => Query<TData>),
    ) => {
      const prev = getOrInit<TData>(key);
      store.set(
        key,
        typeof next === 'function'
          ? (next as (p: Query<TData>) => Query<TData>)(prev)
          : next,
      );

      listeners[key]?.forEach((cb) => cb());
    },
    subscribe: (key, callback) => {
      if (!listeners[key]) listeners[key] = new Set();
      listeners[key].add(callback);
      return () => listeners[key]?.delete(callback);
    },
  };
};

export const queryStore = createQueryStore();
