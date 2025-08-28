type Query<TData> = { data: TData; isLoading: boolean; isError: boolean };
type Listener = () => void;

const store = new Map<string, Query<unknown>>();
const listeners: Record<string, Set<Listener>> = {};

export function subscribe(key: string, callback: Listener) {
  if (!listeners[key]) {
    listeners[key] = new Set();
  }

  listeners[key].add(callback);

  return () => {
    listeners[key]?.delete(callback);
  };
}

export function getSnapshot<TData>(key: string) {
  if (!store.get(key))
    store.set(key, { data: null, isLoading: true, isError: false });

  return store.get(key) as Query<TData>;
}

export function updateQuery<TData>(key: string, newValue: Query<TData>) {
  store.set(key, newValue);

  listeners[key]?.forEach((callback) => callback());
}
