export type Data<T> = {
  data: T | null;
  isLoading: boolean;
  isError: boolean;
  fetchFn?: () => Promise<T>;
  updatedAt: number;
};

export type Listener = () => void;
