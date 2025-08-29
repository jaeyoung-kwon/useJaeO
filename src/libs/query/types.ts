export type Query<TData> = {
  data: TData | null;
  isLoading: boolean;
  isError: boolean;
  updatedAt?: number;
};

export type Listener = () => void;
