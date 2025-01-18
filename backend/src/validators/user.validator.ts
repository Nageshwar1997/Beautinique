export const isValidName = (value: string): boolean => {
  return /^[A-Za-z]+(\s[A-Za-z]+)?$/.test(value.trim());
};

export const isValidEmail = (value: string): boolean => {
  return /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(value.trim());
};

export const isValidPassword = (value: string): boolean => {
  return /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{6,}$/.test(
    value.trim()
  );
};
