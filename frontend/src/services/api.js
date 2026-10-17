
import axios from "axios";

const configuredUrl =
  import.meta.env.VITE_API_URL ||
  "http://127.0.0.1:8000/api";

const baseURL = configuredUrl.replace(/\/+$/, "");

const api = axios.create({
  baseURL,
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Attach JWT access token to API requests.
api.interceptors.request.use(
  (config) => {
    const token =
      localStorage.getItem("access_token") ||
      sessionStorage.getItem("access_token") ||
      localStorage.getItem("access") ||
      sessionStorage.getItem("access");

    if (token) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }

    console.log(
      "API REQUEST:",
      `${config.baseURL}${config.url}`
    );

    return config;
  },
  (error) => Promise.reject(error)
);

// Log API errors to help with debugging.
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error("API ERROR:", {
      url: error.config?.url,
      status: error.response?.status,
      data: error.response?.data,
      message: error.message,
    });

    return Promise.reject(error);
  }
);

export default api;
