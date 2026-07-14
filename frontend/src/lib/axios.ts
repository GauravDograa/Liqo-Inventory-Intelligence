import axios from "axios";

const isBrowser = typeof window !== "undefined";
const isLocalhost =
  isBrowser &&
  ["localhost", "127.0.0.1"].includes(window.location.hostname);

const apiBaseUrl = isBrowser
  ? isLocalhost
    ? "http://localhost:5000/api/v2"
    : "/api/v2"
  : process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000/api/v2";

export const api = axios.create({
  baseURL: apiBaseUrl,
  withCredentials: true,
  timeout: 30000,
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (isBrowser && error.response?.status === 401) {
      window.dispatchEvent(new CustomEvent("liqo:unauthorized"));
    }

    const message =
      error.response?.data?.message ||
      error.message ||
      "Something went wrong";

    return Promise.reject(new Error(message));
  }
);
