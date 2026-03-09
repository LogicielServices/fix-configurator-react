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
  connectionSuccessful: "The connection was made successfully.",
  userWasCreatedSuccessfully: "User was created successfully.",
  userCanNotBeCreated: "User can not be created.",
  areYouSure: "<i>Are you sure?</i>",
  sessionCreatedSuccessfully: "Session created successfully!",
  unableToCreateSession: "Unable to create session!",
  jenkinsConfigurationsWereSavedSuccessfully: "Jenkins configurations were saved successfully.",
  errorInSavingJenkinsConfig: "There was an error in saving jenkins configurations.",
  anErrorOccurred: "An error occurred.",
});
