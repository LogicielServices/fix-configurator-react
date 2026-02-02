import { getAccessToken, getApiUrl } from "../utils/helper";

const getResponseJson = async (res) => {
  try {
    const text = await res.text()
    if (text) {
      return JSON.parse(text)
    }
    return {}
  } catch (e) {
    console.error(e)
    return {}
  }
}

export const Get = async (url, unauthorized = false) => {
  const defaultHeaders = {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  };
  if (!unauthorized) {
    defaultHeaders.headers.Authorization = `Bearer ${getAccessToken()}`;
  }
  const response = await fetch(`${getApiUrl()}${url}`, defaultHeaders)
    .then((res) => res.json())
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
  const apiUrlEndPoint = apiUrl || getApiUrl()
  const response = await fetch(`${apiUrlEndPoint}${url}`, defaultHeaders)
    .then((res) => res.json())
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
  const apiUrlEndPoint = getApiUrl()
  const response = await fetch(`${apiUrlEndPoint}${url}`, defaultHeaders)
    .then((res) => res.json())
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
    .then((res) => res.text())
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
  return response;
};

export async function remove(endpoint, authorize = true) {
  const headers = {}
  if (authorize) {
    const accessToken = getAccessToken()
    headers.Authorization = `Bearer ${accessToken}`
  }
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), 600000)
  try {
    const response = await fetch(getApiUrl() + endpoint, {
      method: 'DELETE',
      headers,
      signal: controller.signal,
    }).then((res) => getResponseJson(res))
    clearTimeout(timeoutId)
    return response
  } catch (error) {
    clearTimeout(timeoutId)
    return {
      data: [],
      status: 'Error',
      message: controller?.signal?.aborted ? 'Request Timeout' : error,
    }
  }
}
