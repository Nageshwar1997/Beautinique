export const validateName = (value: string): boolean => {
  const regex = /^[a-zA-Z\s]+$/;

  if (value.includes("  ") || value[0] === " ") {
    return false;
  }
  return regex.test(value) || value === "";
};

export const validateEmail = (value: string): boolean => {
  const regex = /^[a-zA-Z0-9!@#$%^&()_+\-=[\]{}':"\\|,./]+$/;

  return regex.test(value) || value === "";
};

export const validatePassword = (value: string): boolean => {
  const regex = /^[^\s]+$/;
  return regex.test(value) || value === "";
};

export const isValidNumber = (value: string): boolean => {
  const regex = /^[6-9]\d{9}$/;
  return regex.test(value) || value === "";
};

export const validateNumber = (value: string): string => {
  const newValue = value
    .replace(/\D/g, "") // Remove all non-numeric characters
    .replace(/^([0-5])/, "") // Ensure the first digit is between 6-9
    .slice(0, 10); // Limit the length to 10 digits
  return newValue;
};
