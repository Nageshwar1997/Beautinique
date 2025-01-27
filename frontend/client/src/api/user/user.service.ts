import { useMutation } from "@tanstack/react-query";
import { RegisterInputProps } from "../../types";
import { register_user } from "./user.api";
import { useNavigate } from "react-router-dom";
import { toastErrorMessage, toastSuccessMessage } from "../../utils/toasts";
import { saveUserLocally } from "../../utils";

export const useRegisterUser = () => {
  const navigate = useNavigate();
  return useMutation({
    mutationFn: (bodyData: RegisterInputProps) => register_user(bodyData),
    onSuccess: (data) => {
      toastSuccessMessage(data?.message || "Registration successful!");
    },
    onError: (error: unknown) => {
      toastErrorMessage(
        typeof error === "string" ? error : "Something went wrong!"
      );
    },
    onSettled(data, error) {
      if (data && !error) {
        saveUserLocally(data?.token);
        navigate("/");
      }
      if (error) {
        console.error("Error from mutation:", error);
      }
    },
  });
};
