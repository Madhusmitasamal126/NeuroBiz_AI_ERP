
import axios from "axios";

// ======================================================
// Axios API Instance
// ======================================================

const api = axios.create({
  // If VITE_API_URL exists in .env, use it.
  // Otherwise use Django backend running on port 8000.
  baseURL: import.meta.env.VITE_API_URL || "http://127.0.0.1:8000",

  headers: {
    "Content-Type": "application/json",
  },

  timeout: 10000,
});


// ======================================================
// REQUEST INTERCEPTOR
// ======================================================
// Automatically adds JWT access token to every request.

api.interceptors.request.use(
  (config) => {
    const accessToken =
      localStorage.getItem("access_token") ||
      localStorage.getItem("access") ||
      sessionStorage.getItem("access_token") ||
      sessionStorage.getItem("access");

    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }

    return config;
  },

  (error) => {
    return Promise.reject(error);
  }
);


// ======================================================
// RESPONSE INTERCEPTOR
// ======================================================
// Handles 401 Unauthorized responses.

api.interceptors.response.use(
  (response) => {
    return response;
  },

  (error) => {
    if (error.response?.status === 401) {
      console.log(
        "Unauthorized request - access token may be expired or invalid."
      );

      // Remove old JWT tokens
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");

      localStorage.removeItem("access");
      localStorage.removeItem("refresh");

      sessionStorage.removeItem("access_token");
      sessionStorage.removeItem("refresh_token");

      sessionStorage.removeItem("access");
      sessionStorage.removeItem("refresh");

      // Do not redirect here.
      // React Router / PrivateRoute will handle authentication.
    }

    return Promise.reject(error);
  }
);


// ======================================================
// EXPORT
// ======================================================

export default api;

