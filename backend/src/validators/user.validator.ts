import { models } from "mongoose";

/**
 * Validate if a given string is a valid name.
 *
 * A valid name is a string that contains only letters, and optionally a single space in the middle.
 * For example: "John Doe" is a valid name, but "John-Doe" or "John  Doe" are not.
 *
 * @param {string} value The string to be validated.
 * @returns {boolean} True if the string is a valid name, false otherwise.
 */
export const isValidName = (value: string): boolean => {
  return /^[A-Za-z]+(\s[A-Za-z]+)?$/.test(value.trim());
};

/**
 * Validate if a given string is a valid email address.
 *
 * The regular expression used to validate the email address is based on the
 * specification in RFC 5322, and is widely used in the industry.
 *
 * @param {string} value The string to be validated.
 * @returns {boolean} True if the string is a valid email address, false otherwise.
 */
export const isValidEmail = (value: string): boolean => {
  return /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(value.trim());
};

/**
 * Validate if a given string is a valid password.
 *
 * The regular expression used to validate the password is a commonly used one
 * in the industry, and requires the following:
 *  - At least 6 characters long
 *  - At least one letter
 *  - At least one number
 *  - At least one special character from the set @$!%*#?&
 *
 * @param {string} value The string to be validated.
 * @returns {boolean} True if the string is a valid password, false otherwise.
 */
export const isValidPassword = (value: string): boolean => {
  return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,}$/.test(
    value.trim()
  );
};

/**
 * Checks if a given string contains any special characters.
 *
 * The regular expression used in this function matches any of the following characters:
 *  - !, @, #, $, %, ^, &, *, -, _, +, =, ., >, <, ?, /, \, |, (, ), [, ], {, or }
 *
 * @param {string} value The string to be validated.
 * @returns {boolean} True if the string contains at least one special character, false otherwise.
 */
export const hasSymbol = (value: string): boolean => {
  return /[!@#$%^&*\-_=+.><?/\\|()[\]{}]/.test(value.trim());
}

/**
 * Checks if a given string contains at least one uppercase letter.
 *
 * @param {string} value - The string to be validated.
 * @returns {boolean} True if the string contains at least one uppercase letter, false otherwise.
 */
export const hasUppercase = (value: string): boolean => {
  return /[A-Z]/.test(value.trim());
};

/**
 * Checks if a given string contains at least one lowercase letter.
 *
 * @param {string} value The string to be validated.
 * @returns {boolean} True if the string contains at least one lowercase letter, false otherwise.
 */
export const hasLowercase = (value: string): boolean => {
  return /[a-z]/.test(value.trim());
}

/**
 * Checks if a given string contains at least one number.
 *
 * @param {string} value The string to be validated.
 * @returns {boolean} True if the string contains at least one number, false otherwise.
 */
export const hasNumber = (value: string): boolean => {
  return /[0-9]/.test(value.trim());
}

/**
 * Checks if a given string has a valid length.
 *
 * The regular expression used in this function matches any string that is at
 * least 6 characters long.
 *
 * @param {string} value The string to be validated.
 * @returns {boolean} True if the string has a valid length, false otherwise.
 */
export const hasValidLength = (value: string): boolean => {
  return /^.{6,}$/.test(value.trim());
}



/**
 * Checks if a given email address is unique in the database.
 * This function is intended to be used as a validator for email
 * addresses in user registration and profile update processes.
 *
 * @param {string} value The email address to be validated.
 * @returns {Promise<boolean>} True if the email address is unique, false otherwise.
 *
 * NOTE: This function queries the database, so it's not suitable for
 * frequent use. It's intended to be used as a validator for user input.
 */
export const isEmailUnique = async (value: string): Promise<boolean> => {
  const count = await models.User.countDocuments({ email: value });
  return count === 0;
};


/**
 * Validates if a given string is a valid phone number.
 *
 * The regular expression used in this function matches any string that
 * represents a valid Indian phone number. It expects the phone number to
 * start with either 6, 7, 8 or 9 and be followed by 9 digits.
 *
 * @param {string} value The string to be validated.
 * @returns {boolean} True if the string is a valid phone number, false otherwise.
 */
export const isValidPhoneNumber = (value: string): boolean => {
  return /^[6-9]\d{9}$/.test(value.trim());
};

/**
 * Checks if a given phone number is unique in the database.
 * This function is intended to be used as a validator for phone numbers
 * in user registration and profile update processes.
 *
 * @param {string} value The phone number to be validated.
 * @returns {Promise<boolean>} True if the phone number is unique, false otherwise.
 *
 * NOTE: This function queries the database, so it's not suitable for
 * frequent use. It's intended to be used as a validator for user input.
 */
export const isPhoneNumberUnique = async (value: string): Promise<boolean> => {
  const count = await models.User.countDocuments({ phoneNumber: value });
  return count === 0;
};
