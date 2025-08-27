export type Data<T> = {
  data: T | null;
  isLoading: boolean;
  isError: boolean;
  fetchFn?: () => Promise<T>;
};

export type Listener = () => void;
