import { keepPreviousData, useQuery } from "@tanstack/react-query";

import { get_user_details } from "./user.api";

export const useGetUserDetails = () => {
  const token =
    localStorage.getItem("token") || sessionStorage.getItem("token");

  return useQuery({
    queryKey: ["get_user_details", !!token],
    queryFn: get_user_details,
    enabled: !!token,
    staleTime: Infinity,
    gcTime: Infinity,
    placeholderData: keepPreviousData,
  });
};
