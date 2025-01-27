import { useMutation } from "@tanstack/react-query";
import { LoginInputProps, RegisterInputProps } from "../../types";
import { login_user, register_user } from "./auth.api";
import { useNavigate } from "react-router-dom";
import { toastErrorMessage, toastSuccessMessage } from "../../utils/toasts";
import { saveUserLocal, saveUserSession } from "../../utils";

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
    onSettled(data, error, variables) {
      if (data && !error) {
        if (variables?.remember) {
          saveUserLocal(data?.token);
        } else {
          saveUserSession(data?.token);
        }
        navigate("/");
      }
      if (error) {
        console.error("Error from mutation:", error);
      }
    },
  });
};

export const useLoginUser = () => {
  const navigate = useNavigate();
  return useMutation({
    mutationFn: (bodyData: LoginInputProps) => login_user(bodyData),
    onSuccess: (data) => {
      toastSuccessMessage(data?.message || "Login successful!");
    },
    onError: (error: unknown) => {
      toastErrorMessage(
        typeof error === "string" ? error : "Something went wrong!"
      );
    },
    onSettled(data, error, variables) {
      if (data && !error) {
        if (variables?.remember) {
          saveUserLocal(data?.token);
        } else {
          saveUserSession(data?.token);
        }
        navigate("/");
      }
      if (error) {
        console.error("Error from mutation:", error);
      }
    },
  });
};
