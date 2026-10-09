
import api from "./api";

// Register a user
export const registerUser = async (userData) => {
  const response = await api.post(
    "/accounts/register/",
    userData
  );

  return response.data;
};

// Log in
export const loginUser = async (username, password) => {
  const response = await api.post("/auth/login/", {
    username,
    password,
  });

  console.log("LOGIN RESPONSE:", response.data);

  return response.data;
};

// Log out
export const logoutUser = () => {
  const keys = [
    "access_token",
    "refresh_token",
    "access",
    "refresh",
  ];

  keys.forEach((key) => {
    localStorage.removeItem(key);
    sessionStorage.removeItem(key);
  });
};