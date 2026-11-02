import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

import {
  loginUser,
  logoutUser,
} from "../services/auth";

import api from "../services/api";

const AuthContext = createContext(null);

// =====================================================
// USE AUTH
// =====================================================

export const useAuth = () => {
  return useContext(AuthContext);
};

// =====================================================
// AUTH PROVIDER
// =====================================================

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // =====================================================
  // CHECK EXISTING LOGIN
  // =====================================================

  useEffect(() => {
    const accessToken =
      localStorage.getItem("access_token") ||
      sessionStorage.getItem("access_token") ||
      localStorage.getItem("access") ||
      sessionStorage.getItem("access");

    if (accessToken) {
      setUser({
        loggedIn: true,
      });
    } else {
      setUser(null);
    }

    setLoading(false);
  }, []);

  // =====================================================
  // LOGIN
  // =====================================================

  const login = async (
    username,
    password,
    remember = false
  ) => {
    const data = await loginUser(username, password);

    console.log("LOGIN DATA:", data);

    if (!data?.access) {
      throw new Error(
        "Access token was not received from Django."
      );
    }

    // Remove old tokens from both storages.
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("access");
    localStorage.removeItem("refresh");

    sessionStorage.removeItem("access_token");
    sessionStorage.removeItem("refresh_token");
    sessionStorage.removeItem("access");
    sessionStorage.removeItem("refresh");

    // Save new tokens.
    const storage = remember
      ? localStorage
      : sessionStorage;

    storage.setItem("access_token", data.access);

    if (data.refresh) {
      storage.setItem("refresh_token", data.refresh);
    }

    console.log("TOKEN SAVED:", remember);

    // Update logged-in user.
    setUser({
      username,
      loggedIn: true,
    });

    return data;
  };

  // =====================================================
  // LOGOUT + AUTOMATIC ATTENDANCE CHECKOUT
  // =====================================================

  const logout = async () => {
    try {
      // Close the attendance session in Django first.
      // This assumes Axios baseURL already includes /api.
      await api.post("/auth/logout/");
    } catch (error) {
      console.error(
        "Attendance checkout failed:",
        error
      );
    } finally {
      // Clear tokens regardless of checkout request result.
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");
      localStorage.removeItem("access");
      localStorage.removeItem("refresh");

      sessionStorage.removeItem("access_token");
      sessionStorage.removeItem("refresh_token");
      sessionStorage.removeItem("access");
      sessionStorage.removeItem("refresh");

      // Preserve existing auth-service cleanup.
      try {
        logoutUser();
      } catch (error) {
        console.error(
          "Logout service cleanup failed:",
          error
        );
      }

      setUser(null);
      window.location.href = "/login";
    }
  };

  // =====================================================
  // CONTEXT
  // =====================================================

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
