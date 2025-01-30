import CryptoJS from "crypto-js";

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
