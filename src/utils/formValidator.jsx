export const firstAndLastNameValidation = {
  pattern: /^[\w'\-,.][^0-9_!¡?÷?¿/\\+=@#$%ˆ^`&*(){}|~<>;:[\]]{2,59}$/,
  message:
    " should be between 3 to 60 characters without numbers and special characters.",
};

export const userNameValidation = {
  pattern: /^[a-zA-Z0-9_.-]{3,30}$/,
  message:
    "Username should be between 3 to 30 characters and can only contain letters, numbers, and the characters '-', '.', and '_'.",
};

export const passwordValidation = {
  pattern: /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*(),.?":{}|<>~_\-=+[\]\\;'/]).*$/,
  message:
    "Password must be at least 8 characters long and contain a mix of uppercase and lowercase letters, digits, and special characters, with a maximum length of 50 characters.",
  unmatchedPasswordAndConfirmPassword: "Password and confirm password must be matching.",
};

export const reportEmailsValidation = {
  pattern: /^([\w+.\-%]+@[\w+.]+\.[A-Za-z]{2,4},?){1,20}$/,
  message:
    'Please enter a valid email address. Multiple email addresses should be separated by commas.',
};

export const emailValidation = {
  pattern: /\S+@\S+\.\S+/,
  message: "Invalid email format.",
};

export const fixMessagesGridPatterns = {
  sendingTimePattern: /^(\d{4})(\d{2})(\d{2})-(\d{2}):(\d{2}):(\d{2})(?:\.(\d+))?$/,
}

export const ipv4Regex = {
  basicPattern: /^[0-9.]*$/,
  pattern: /^(?:(?:25[0-5]|2[0-4]\d|1?\d?\d)(?:\.(?:25[0-5]|2[0-4]\d|1?\d?\d)){3})$/,
  message: "Invalid Destination IP Address.",
  helperText: "Enter IPv4 (e.g., 192.168.0.1)",
}

export const isRequired = " is required.";

export const isRequiredValidationMessages = {
  firstName: `First Name${isRequired}`,
  lastName: `Last Name${isRequired}`,
  username: `Username${isRequired}`,
  email: `Email${isRequired}`,
  password: `Password${isRequired}`,
  confirmPassword: `Confirm Password${isRequired}`,
};

export const validateFields = (formType, fieldsData) => {
  const errors = {};
  switch (formType) {
    case "Users":
      if (!fieldsData?.firstName?.trim()) {
        errors.firstName = isRequiredValidationMessages.firstName;
      } else if (
        !firstAndLastNameValidation?.pattern?.test(fieldsData.firstName)
      ) {
        errors.firstName = `First Name ${firstAndLastNameValidation?.message}`;
      }
      if (!fieldsData?.lastName?.trim()) {
        errors.lastName = isRequiredValidationMessages.lastName;
      } else if (
        !firstAndLastNameValidation?.pattern?.test(fieldsData.lastName)
      ) {
        errors.lastName = `Last Name ${firstAndLastNameValidation?.message}`;
      }
      if (!fieldsData?.username?.trim()) {
        errors.username = isRequiredValidationMessages.username;
      } else if (!userNameValidation?.pattern?.test(fieldsData?.username)) {
        errors.username = userNameValidation?.message;
      }
      if (!fieldsData?.email?.trim()) {
        errors.email = isRequiredValidationMessages.email;
      } else if (!emailValidation?.pattern?.test(fieldsData?.email)) {
        errors.email = emailValidation?.message;
      }
      if (!fieldsData?.password?.trim()) {
        errors.password = isRequiredValidationMessages.password;
      } else if (!passwordValidation?.pattern?.test(fieldsData?.password)) {
        errors.password = passwordValidation?.message;
      } else if (fieldsData?.password !== fieldsData?.confirmPassword) {
        errors.password = passwordValidation?.unmatchedPasswordAndConfirmPassword;
        errors.confirmPassword = passwordValidation?.unmatchedPasswordAndConfirmPassword;
      }
      if (!fieldsData?.confirmPassword?.trim()) {
        errors.confirmPassword = isRequiredValidationMessages.confirmPassword;
      } else if (!passwordValidation?.pattern?.test(fieldsData?.confirmPassword)) {
        errors.confirmPassword = passwordValidation?.message;
      }
      break;
    case "Telnet":
      if (fieldsData?.destinationIP && !ipv4Regex.pattern.test(fieldsData?.destinationIP)) {
        errors.destinationIP = ipv4Regex?.message;
      }
      break;
    default:
      break;
  }
  return errors;
};
