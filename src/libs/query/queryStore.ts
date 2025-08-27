import { Data, Listener } from './types';

type Store<T> = Record<string, Data<T>>;

export interface QueryStore {
  getSnapshot: <T>(key: string) => Data<T> | null;
  setSnapshot: <T>(
    key: string,
    next: Data<T> | ((prev: Data<T> | null) => Data<T>),
  ) => void;
  subscribe: (key: string, callback: Listener) => () => void;
}

export const createQueryStore = (): QueryStore => {
  const store: Store<unknown> = {};
  const listeners: Record<string, Set<Listener>> = {};

  const notify = (key: string) => {
    listeners[key]?.forEach((cb) => cb());
  };

  return {
    getSnapshot: <T>(key: string) => {
      return (store[key] as Data<T>) ?? null;
    },
    setSnapshot: <T>(key, next) => {
      const prev = (store[key] as Data<T>) ?? null;
      store[key] =
        typeof next === 'function'
          ? (next as (p: Data<T> | null) => Data<T>)(prev)
          : next;
      notify(key);
    },
    subscribe: (key, callback) => {
      if (!listeners[key]) listeners[key] = new Set();
      listeners[key].add(callback);
      return () => listeners[key]?.delete(callback);
    },
  };
};

// 실제 인스턴스 생성해서 사용
export const queryStore = createQueryStore();
