import { refreshAccessToken } from "../Services/AuthService";
import { authConstants } from "./constants";

export const isLoggedIn = () => localStorage.getItem(authConstants.accessToken);

export const checkExpirationTime = () => {
  const accessTokenExpiry = localStorage.getItem(
    authConstants.accessTokenExpiration
  );
  const refreshTokenExpiry = localStorage.getItem(
    authConstants.refreshTokenExpiration
  );
  const now = Date.now();
  let timeLeft = new Date(refreshTokenExpiry) - now;
  if (timeLeft <= 0) {
    logout();
    return;
  }
  timeLeft = new Date(accessTokenExpiry) - now;
  if (timeLeft < 60 * 1000) {
    // Less than 1 min remaining → refresh
    refreshAccessToken();
  }
};

export const logout = () => {
  localStorage.clear();
  window.location.href = "/login";
};

export const getAccessToken = () =>
  localStorage.getItem(authConstants.accessToken);

export const getRefreshToken = () =>
  localStorage.getItem(authConstants.refreshToken);

export const getApiUrl = () => localStorage.getItem(authConstants.apiUrl);

export function parseJwt() {
  const token = localStorage.getItem(authConstants.accessToken);
  const base64Url = token?.split(".")[1];
  if (!base64Url) {
    return {};
  }
  const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
  const jsonPayload = decodeURIComponent(
    window
      .atob(base64)
      .split("")
      .map((c) => {
        return `%${`00${c.charCodeAt(0).toString(16)}`.slice(-2)}`;
      })
      .join("")
  );

  return JSON.parse(jsonPayload);
}

export const camelCaseToTitleCase = (str) => {
  const result = `${str}`.replace(/([A-Z])/g, ' $1')
  return result.charAt(0).toUpperCase() + result.slice(1)
}

export const enumToList = (
  e,
  key = 'ID',
  value = 'Name',
  isTitleCased = false,
) => {
  return Object.entries(e).map((x) => {
    const obj = {}
    obj[key] = isTitleCased ? camelCaseToTitleCase(x[1]) : x[1]
    obj[value] = isTitleCased ? camelCaseToTitleCase(x[0]) : x[0]
    return obj
  })
}

export const booleanEnum = Object.freeze({
  Yes: 'Y',
  No: 'N',
})

export const getEnumKeyByValue = (enumRef, value, isTitleCased = false) => {
  const key =
    Object.keys(enumRef || [])?.[Object.values(enumRef || []).indexOf(value)] ||
    ''
  return key;
}
