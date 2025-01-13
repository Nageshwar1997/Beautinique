export const registerInputMapData = [
  {
    placeholder: "First Name",
    field: "firstName",
    register: {
      required: "First Name is required",
      maxLength: {
        value: 20,
        message: "First Name cannot be more than 20 characters",
      },
      pattern: {
        value: /^[A-Za-z]+(\s[A-Za-z]+)?$/,
        message: "Contains only letters and spaces",
      },
      setValueAs: (value: string) => value.trim(),
    },
  },
  {
    placeholder: "Last Name",
    field: "lastName",
    register: {
      required: "Last Name is required",
      maxLength: {
        value: 20,
        message: "Last Name cannot be more than 20 characters",
      },
      pattern: {
        value: /^[A-Za-z]+(\s[A-Za-z]+)?$/,
        message: "Contains only letters and spaces",
      },
      setValueAs: (value: string) => value.trim(),
    },
  },
  {
    placeholder: "Email Address",
    field: "email",
    register: {
      required: "Email Address is required",
      pattern: {
        value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
        message: "Invalid email address",
      },
      setValueAs: (value: string) => value.trim(),
    },
  },
  {
    placeholder: "Phone Number",
    field: "phoneNumber",
    register: {
      required: "Phone number is required",
      pattern: {
        value: /^[6-9]\d{9}$/,
        message: "Invalid phone number",
      },
      setValueAs: (value: string) => value.trim(),
    },
  },
  {
    placeholder: "Password",
    field: "password",
    icon: true,
    register: {
      required: "Password is required",
      pattern: {
        value: /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{6,}$/,
        message:
          "Password must be at least 6 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character",
      },
      setValueAs: (value: string) => value.trim(),
    },
  },
  {
    placeholder: "Confirm Password",
    field: "confirmPassword",
    icon: true,
    register: {
      required: "Confirm Password is required",
      pattern: {
        value: /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{6,}$/,
        message:
          "Confirm Password must be at least 6 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character",
      },
      setValueAs: (value: string) => (value || "").trim(),
    },
  },
];
