import Joi from "joi";

const validateFirstName = Joi.string()
  .pattern(/^(?!.*\d)(?!.* {2})([A-Za-z]+( [A-Za-z]+)*)$/)
  .min(2)
  .max(50)
  .presence("required")
  .messages({
    "any.required": "First name is required.",
    "string.empty": "First name cannot be empty.",
    "string.min": "First name should be at least 2 characters long.",
    "string.max": "First name should not exceed 50 characters.",
    "string.base": "First name must be a text value.",
    "string.pattern.base":
      "First name can only contain letters and only one space is allowed between words.",
  });

const validateLastName = Joi.string()
  .pattern(/^(?!.*\d)(?!.* {2})([A-Za-z]+( [A-Za-z]+)*)$/)
  .min(2)
  .max(50)
  .presence("required")
  .messages({
    "any.required": "Last name is required.",
    "string.empty": "Last name cannot be empty.",
    "string.min": "Last name should be at least 2 characters long.",
    "string.max": "Last name should not exceed 50 characters.",
    "string.base": "Last name must be a text value.",
    "string.pattern.base":
      "Last name can only contain letters and only one space is allowed between words.",
  });

const validateEmail = Joi.string()
  .email()
  // .email({ tlds: { allow: ["com", "in", "org"] } }) // It will allow only this domains
  .presence("required")
  .messages({
    "any.required": "Email address is required.",
    "string.empty": "Email address cannot be empty.",
    "string.base": "Email address must be string.",
    "string.email": "Please enter a valid email address.",
  });

const validatePhoneNumber = Joi.string()
  .pattern(/^[6-9][0-9]{9}$/)
  .presence("required") // Ensures the key must be present
  .messages({
    "any.required": "Phone number is required.",
    "string.empty": "Phone number cannot be empty.",
    "string.base": "Phone number must be a string.",
    "string.pattern.base":
      "Phone number must be a valid Indian number starting with 6, 7, 8, or 9 and be exactly 10 digits long.",
  });

const validatePassword = Joi.string()
  .pattern(/^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@$!%*?&#])(?=\S.*$).{6,20}$/)
  .presence("required")
  .messages({
    "any.required": "Password is required.",
    "string.empty": "Password cannot be empty.",
    "string.base": "Password must be string.",
    "string.pattern.base":
      "Password must be 6-20 characters long, include at least one uppercase letter, one lowercase letter, one number, and one special character.",
  });

export const registerUserValidationSchema = Joi.object({
  firstName: validateFirstName,
  lastName: validateLastName,
  email: validateEmail,
  phoneNumber: validatePhoneNumber,
  password: validatePassword,
  folderName: Joi.string().optional().default("Profile_Pictures"),
});

export const loginUserValidationSchema = Joi.object({
  email: validateEmail.optional(),
  phoneNumber: validatePhoneNumber.optional(),
  password: validatePassword,
})
  .or("email", "phoneNumber") // Ensures at least one is present
  .messages({
    "object.missing": "Either email or phone number is required.",
  });
