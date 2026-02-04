import { authConstants } from "../utils/constants";
import { getRefreshToken, logout } from "../utils/helper";
import { Post } from "./ApiService.js";

export const refreshAccessToken = async () => {
  const refreshToken = getRefreshToken();
  const body = { refreshToken };
  const response = await Post('/refresh', body, null, true);
  if (!response?.isSuccess) {
    logout();
    return;
  }
  localStorage.setItem(authConstants.accessToken, response?.data?.accessToken);
  localStorage.setItem(
    authConstants.accessTokenExpiration,
    response?.data?.accessTokenExpiration
  );
};

export const login = async (apiUrl, username, password, rememberMe) => {
  const body = { username, password, rememberMe };
  const response = await Post('/api/account/login', body, apiUrl, true);
  return response;
};
