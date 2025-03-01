import { AxiosError } from "axios";
import api from "../../configs/axios.instance.config";
import { getUserToken } from "../../utils";

export const get_user_details = async () => {
  try {
    const token = getUserToken();
    const response = await api.get("/user", {
      headers: {
        Authorization: `${token}`,
      },
    });
    return response.data;
  } catch (error) {
    if (error instanceof AxiosError) {
      // If it's an Axios error
      throw error?.response?.data?.message || "API Error occurred";
    }
    throw "Something went wrong!"; // For non-Axios errors
  }
};
