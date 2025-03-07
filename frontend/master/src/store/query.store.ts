import { create } from "zustand";
import { QueryClient } from "@tanstack/react-query";

interface QueryStoreType {
  queryClient: QueryClient;
}

export const useQueryStore = create<QueryStoreType>(() => ({
  queryClient: new QueryClient(),
}));
