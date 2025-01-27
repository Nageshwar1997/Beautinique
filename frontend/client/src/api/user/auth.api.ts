import { AxiosError } from "axios";
import api from "../../configs/axios.instance.config";
import { RegisterInputProps } from "../../types";

export const register_user = async (bodyData: RegisterInputProps) => {
  try {
    const response = await api.post("/auth/register", bodyData);
    return response.data;
  } catch (error) {
    if (error instanceof AxiosError) {
      // If it's an Axios error
      throw error?.response?.data?.message || "API Error occurred";
    }
    throw "Something went wrong!"; // For non-Axios errors
  }
};
