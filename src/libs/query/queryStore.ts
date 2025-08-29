import { Listener, Query } from './types';

type Store<TData> = Map<string, Query<TData>>;

const initState = (): Query<unknown> => ({
  data: null,
  isLoading: true,
  isError: false,
  updatedAt: 0,
});

export interface QueryStore {
  getSnapshot: <TData>(key: string) => Query<TData>;
  setSnapshot: <TData>(
    key: string,
    next: Query<TData> | ((prev: Query<TData>) => Query<TData>),
  ) => void;
  subscribe: (key: string, callback: Listener, gcTime: number) => () => void;
}

export const createQueryStore = (): QueryStore => {
  const store: Store<unknown> = new Map<string, Query<unknown>>();
  const listeners: Record<string, Set<Listener>> = {};
  const gcTimeouts = new Map<string, ReturnType<typeof setTimeout>>();

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
    subscribe: (key, callback, gcTime) => {
      if (!listeners[key]) listeners[key] = new Set();
      listeners[key].add(callback);

      const timeout = gcTimeouts.get(key);
      if (timeout) {
        clearTimeout(timeout);
        gcTimeouts.delete(key);
      }

      return () => {
        listeners[key]?.delete(callback);

        if (listeners[key]?.size === 0) {
          delete listeners[key];
          const timeout = setTimeout(() => {
            store.delete(key);
            gcTimeouts.delete(key);
          }, gcTime);
          gcTimeouts.set(key, timeout);
        }
      };
    },
  };
};

export const queryStore = createQueryStore();
