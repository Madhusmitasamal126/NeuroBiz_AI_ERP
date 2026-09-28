import { createContext, useContext, useEffect, useState } from "react";
import { loginUser, logoutUser } from "../services/auth";

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token =
      localStorage.getItem("access") ||
      sessionStorage.getItem("access");

    if (token) {
      setUser({ loggedIn: true });
    }

    setLoading(false);
  }, []);

  const login = async (
    username,
    password,
    remember
  ) => {
    const data = await loginUser(username, password);

    if (remember) {
      localStorage.setItem("access", data.access);
      localStorage.setItem("refresh", data.refresh);
    } else {
      sessionStorage.setItem("access", data.access);
      sessionStorage.setItem("refresh", data.refresh);
    }

    setUser({ username });
  };

  const logout = () => {
    logoutUser();
    setUser(null);
    window.location.href = "/";
  };

  return (
    <AuthContext.Provider
      value={{ user, login, logout, loading }}
    >
      {children}
    </AuthContext.Provider>
  );
}