import { useMutation } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { RegisterInputProps } from "../../types";
import { register_user } from "./user.api";
import { useNavigate } from "react-router-dom";
import { toastErrorMessage } from "../../utils/errors";
import { SaveUserData } from "../../utils";

export const useRegisterUser = () => {
  const navigate = useNavigate();
  return useMutation({
    mutationFn: (bodyData: RegisterInputProps) => register_user(bodyData),
    onSuccess: (data) => {
      localStorage.setItem("token", data?.token);
      toast.success(data?.message || "Registration successful!");
      console.log("Response Data:", data);
    },
    onError: (error: unknown) => {
      if (typeof error === "string") {
        toastErrorMessage(error);
      } else {
        toastErrorMessage("Something went wrong!");
      }
    },
    onSettled(data, error) {
      if (data && !error) {
        SaveUserData(data?.token);
        navigate("/");
      }
      if (error) {
        console.error("Error from mutation:", error);
      }
    },
  });
};
