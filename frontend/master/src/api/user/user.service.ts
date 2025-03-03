import { keepPreviousData, useQuery } from "@tanstack/react-query";

import { get_user_details } from "./user.api";

export const useGetUserDetails = () => {
  const master_token =
    localStorage.getItem("master_token") ||
    sessionStorage.getItem("master_token");

  return useQuery({
    queryKey: ["get_user_details", !!master_token],
    queryFn: get_user_details,
    enabled: !!master_token,
    staleTime: Infinity,
    gcTime: Infinity,
    placeholderData: keepPreviousData,
  });
};
