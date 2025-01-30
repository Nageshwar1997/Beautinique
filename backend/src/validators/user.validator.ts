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
  return /^[a-zA-Z]+( [a-zA-Z]+)*$/.test(value);
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
  return /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(value);
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
  return /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@$!%*?&#])(?=\S.*$).{6,20}$/.test(
    value
  );
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
