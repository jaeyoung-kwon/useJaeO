import { Data, Listener } from './types';

type Store<T> = Map<string, Data<T>>;

export interface QueryStore {
  getSnapshot: <T>(key: string) => Data<T> | null;
  setSnapshot: <T>(
    key: string,
    next: Data<T> | ((prev: Data<T> | null) => Data<T>),
  ) => void;
  subscribe: (key: string, callback: Listener, gcTime: number) => () => void;
}

export const createQueryStore = (): QueryStore => {
  const store: Store<unknown> = new Map<string, Data<unknown>>();
  const listeners: Record<string, Set<Listener>> = {};
  const gcTimeouts = new Map<string, ReturnType<typeof setTimeout>>();

  const notify = (key: string) => {
    listeners[key]?.forEach((cb) => cb());
  };

  return {
    getSnapshot: <T>(key: string): Data<T> | null => {
      return (store.get(key) as Data<T>) ?? null;
    },
    setSnapshot: <T>(
      key: string,
      next: Data<T> | ((prev: Data<T> | null) => Data<T>),
    ): void => {
      const prev = queryStore.getSnapshot<T>(key);
      store.set(
        key,
        typeof next === 'function'
          ? (next as (p: Data<T> | null) => Data<T>)(prev)
          : next,
      );
      notify(key);
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

// 실제 인스턴스 생성해서 사용
export const queryStore = createQueryStore();
