import CryptoJS from "crypto-js";
import {
  dummyFeedbacks,
  highlightedCategoryOptions,
} from "../components/navbar/data";
import { toastErrorMessage } from "./toasts";

const ENCRYPTION_SECRET_KEY = import.meta.env.VITE_ENCRYPTION_SECRET_KEY;

export const encryptData = (data: string): string => {
  return CryptoJS.AES.encrypt(data, ENCRYPTION_SECRET_KEY).toString();
};

export const saveUserLocal = (data: string) => {
  removeUserSession();
  localStorage.setItem("token", encryptData(JSON.stringify(data)));
};

export const saveUserSession = (data: string) => {
  removeUserLocal();
  sessionStorage.setItem("token", encryptData(JSON.stringify(data)));
};

export const removeUserLocal = () => {
  localStorage.removeItem("token");
};

export const removeUserSession = () => {
  sessionStorage.removeItem("token");
};

export const getUserToken = () => {
  const token =
    localStorage.getItem("token") || sessionStorage.getItem("token");

  if (!token) {
    toastErrorMessage("Please login first!");
    window.location.href = "/login";
    return null;
  }

  return JSON.parse(
    CryptoJS.AES.decrypt(token, ENCRYPTION_SECRET_KEY).toString(
      CryptoJS.enc.Utf8
    )
  );
};

export const getTodaysFeedback = (
  forwardIndex: 0 | 1 | 2 | 3 | 4 | 5 | 6 = 0
) => {
  // Get the current date
  const today = new Date();
  // Get the day of the month (1 to 31)
  const day = today.getDate();
  // Calculate the feedback index for today
  const feedbackIndex = (day + forwardIndex) % dummyFeedbacks.length;
  // Get the feedback for today
  const todayFeedback = dummyFeedbacks[feedbackIndex];

  return todayFeedback;
};

// It return a boolean value is level 3 category option is highlighted or not
export const isHighlightedOption = (option: string) =>
  highlightedCategoryOptions.includes(option);
