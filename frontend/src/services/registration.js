import api from "./api";

export const registerUser = async (userData) => {
  const response = await api.post(
    "/api/accounts/register/",
    userData
  );
  return response.data;
};