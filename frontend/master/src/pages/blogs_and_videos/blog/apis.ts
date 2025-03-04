import { useMutation } from "@tanstack/react-query";
import api from "../../../configs/axios.instance.config";
import toast from "react-hot-toast";
import axios, { AxiosError } from "axios";

export const add_blogs = async (data: FormData) => {
  const master_token =
    localStorage.getItem("master_token") ||
    sessionStorage.getItem("master_token");
  return await api.post("/blog", data, {
    headers: {
      Authorization: master_token,
    },
  });
};
export const useAddBlogs = () => {
  return useMutation({
    mutationKey: ["add_blogs"],
    mutationFn: (body: FormData) => add_blogs(body),
    onSuccess: () => {
      toast.success("Blogs added successfully");
    },
    onError: (error) => {
      if (axios.isAxiosError(error)) {
        toast.error(error.response?.data.message);
      }
    },
  });
};

export const add_image_to_cdn = async (data: FormData) => {
  const master_token =
    localStorage.getItem("master_token") ||
    sessionStorage.getItem("master_token");
  try {
    return await api.post("/blog/img-upload", data, {
      headers: {
        Authorization: master_token,
        "Content-Type": "multipart/form-data",
      },
    });
  } catch (error) {
    if (error instanceof AxiosError) {
      toast.error(error?.response?.data?.message || "API Error occurred");
      throw error?.response?.data?.message || "API Error occurred";
    }
    toast.error("Something went wrong!");
    throw "Something went wrong!";
  }
};
