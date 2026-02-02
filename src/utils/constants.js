export const authConstants = Object.freeze({
  username: "username",
  password: "password",
  accessToken: "accessToken",
  refreshToken: "refreshToken",
  role: "role",
  apiUrl: "apiUrl",
  accessTokenExpiration: "accessTokenExpiration",
  refreshTokenExpiration: "refreshTokenExpiration",
  codeId: "codeId",
  resetPassword: "resetPassword",
  forgetPasswordCodeId: "forgetPasswordCodeId",
  loginId: "loginId",
});

export const pathConstants = Object.freeze({
  login: "/login",
  dashboard: "/dashboard",
});

export const REFRESH_INTERVAL = 60 * 1000; // 1 minute

export const severities = Object.freeze({
  error: "error",
  info: "info",
  success: "success",
  warning: "warning",
});

export const textMessages = Object.freeze({
  unableToCheckConnectivity: "Unable to check connectivity.",
  userCanNotBeCreated: "User can not be created.",
});
