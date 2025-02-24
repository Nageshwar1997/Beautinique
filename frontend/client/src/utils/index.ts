import CryptoJS from "crypto-js";
import { dummyFeedbacks } from "../components/navbar/components/lips/data";

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
