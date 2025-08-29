export type Query<TData> = {
  data: TData | null;
  isLoading: boolean;
  isError: boolean;
};

export type Listener = () => void;
