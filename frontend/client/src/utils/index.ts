import CryptoJS from "crypto-js";

const ENCRYPTION_SECRET_KEY = import.meta.env.VITE_ENCRYPTION_SECRET_KEY;

export const encryptData = (data: string): string => {
  return CryptoJS.AES.encrypt(data, ENCRYPTION_SECRET_KEY).toString();
};

export const saveUserLocally = (data: string) => {
  localStorage.setItem("token", encryptData(JSON.stringify(data)));
};
