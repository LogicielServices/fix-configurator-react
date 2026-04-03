import { getAccessToken, getApiUrl, logout } from "../utils/helper";
import { pathConstants } from "../utils/constants";

/**
 * Handle HTTP error status codes centrally.
 * 401 → logout (token invalid/expired server-side)
 * 403 → redirect to unauthorized page
 */
const handleResponseStatus = (response) => {
  if (response.status === 401) {
    logout();
    return null;
  }
  if (response.status === 403) {
    window.location.href = pathConstants.unauthorized;
    return null;
  }
  return response;
};

const getResponseJson = async (res) => {
  try {
    const text = await res.text();
    if (text) {
      return JSON.parse(text);
    }
    return {};
  } catch (e) {
    console.error(e);
    return {};
  }
};

export const Get = async (url, unauthorized = false) => {
  const defaultHeaders = {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  };
  if (!unauthorized) {
    defaultHeaders.headers.Authorization = `Bearer ${getAccessToken()}`;
  }
  const response = await fetch(`${getApiUrl()}${url}`, defaultHeaders)
    .then((res) => {
      if (!handleResponseStatus(res)) return null;
      return res.json();
    })
    .catch((err) => {
      console.error("Fetch error:", err);
      return null;
    });
  return response;
};

export const Post = async (url, body, apiUrl = null, unauthorized = false) => {
  const defaultHeaders = {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  };
  if (!unauthorized) {
    defaultHeaders.headers.Authorization = `Bearer ${getAccessToken()}`;
  }
  const apiUrlEndPoint = apiUrl || getApiUrl();
  const response = await fetch(`${apiUrlEndPoint}${url}`, defaultHeaders)
    .then((res) => {
      if (!handleResponseStatus(res)) return null;
      return res.json();
    })
    .catch((err) => {
      console.error("Fetch error:", err);
      return null;
    });
  return response;
};

export const Put = async (url, body, apiUrl = null, unauthorized = false) => {
  const defaultHeaders = {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  };
  if (!unauthorized) {
    defaultHeaders.headers.Authorization = `Bearer ${getAccessToken()}`;
  }
  const apiUrlEndPoint = apiUrl || getApiUrl();
  const response = await fetch(`${apiUrlEndPoint}${url}`, defaultHeaders)
    .then((res) => {
      if (!handleResponseStatus(res)) return null;
      return res.json();
    })
    .catch((err) => {
      console.error("Fetch error:", err);
      return null;
    });
  return response;
};

export const Delete = async (url) => {
  const defaultHeaders = {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
  };
  defaultHeaders.headers.Authorization = `Bearer ${getAccessToken()}`;
  const apiUrlEndPoint = getApiUrl();
  const response = await fetch(`${apiUrlEndPoint}${url}`, defaultHeaders)
    .then((res) => {
      if (!handleResponseStatus(res)) return null;
      return res.json();
    })
    .catch((err) => {
      console.error("Fetch error:", err);
      return null;
    });
  return response;
};

export const ApiWithTextResponse = async (props, unauthorized = false) => {
  const defaultHeaders = {
    method: props?.method || "GET",
    headers: { "Content-Type": "application/json" },
  };
  if (props?.method === "POST") {
    defaultHeaders.body = JSON.stringify(props?.body);
  }
  if (!unauthorized) {
    defaultHeaders.headers.Authorization = `Bearer ${getAccessToken()}`;
  }
  const response = await fetch(`${getApiUrl()}${props?.url}`, defaultHeaders)
    .then((res) => {
      if (!handleResponseStatus(res)) return null;
      return res.text();
    })
    .catch((err) => {
      console.error("Fetch error:", err);
      return null;
    });
  return response;
};

export const Download = async (url, unauthorized = false) => {
  const defaultHeaders = {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  };
  if (!unauthorized) {
    defaultHeaders.headers.Authorization = `Bearer ${getAccessToken()}`;
  }
  const response = await fetch(`${getApiUrl()}${url}`, defaultHeaders);
  if (!handleResponseStatus(response)) return null;
  return response;
};

export async function remove(endpoint, authorize = true) {
  const headers = {};
  if (authorize) {
    const accessToken = getAccessToken();
    headers.Authorization = `Bearer ${accessToken}`;
  }
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 600000);
  try {
    const res = await fetch(getApiUrl() + endpoint, {
      method: "DELETE",
      headers,
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    if (!handleResponseStatus(res)) return null;
    return getResponseJson(res);
  } catch (error) {
    clearTimeout(timeoutId);
    return {
      data: [],
      status: "Error",
      message: controller?.signal?.aborted ? "Request Timeout" : error,
    };
  }
}
