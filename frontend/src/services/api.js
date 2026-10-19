
import axios from "axios";

const configuredUrl =
  import.meta.env.VITE_API_URL || "http://127.0.0.1:8000/api/";

const baseURL = configuredUrl.replace(/\/+$/, "") + "/";

const api = axios.create({
  baseURL,
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Find the JWT access token saved after login.
function getAccessToken() {
  const tokenKeys = ["access_token", "access", "accessToken"];

  for (const storage of [localStorage, sessionStorage]) {
    for (const key of tokenKeys) {
      const token = storage.getItem(key);

      if (token && token !== "null" && token !== "undefined") {
        return token.trim();
      }
    }
  }

  return null;
}

// Add the JWT token to each API request.
api.interceptors.request.use(
  (config) => {
    const token = getAccessToken();

    if (token) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }

    if (import.meta.env.DEV) {
      console.log("API REQUEST:", {
        method: config.method,
        url: `${config.baseURL || ""}${config.url || ""}`,
        tokenAttached: Boolean(token),
      });
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Report useful API errors.
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const data = error.response?.data;

    console.error("API ERROR:", {
      url: error.config?.url,
      status,
      data,
      message: error.message,
    });

    if (!error.response) {
      console.error(
        "Cannot reach Django. Check that the backend is running at",
        baseURL
      );
    } else if (status === 401) {
      console.error(
        "Authentication failed. Sign in again and verify that the saved access token is valid."
      );
    } else if (status === 403) {
      console.error(
        "You are authenticated but do not have permission for this operation."
      );
    } else if (status === 404) {
      console.error(
        "The API endpoint does not exist. Check Django backend/urls.py and the app URL configuration."
      );
    }

    return Promise.reject(error);
  }
);

export default api;
