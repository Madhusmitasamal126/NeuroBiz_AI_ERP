import api from "./api";

export const registerUser = async (userData) => {
  try{
        const response = await api.post("/api/accounts/register/", userData);
         return response.data;
  }
  catch (error) {
    console.log(error.response.data);  
    throw error;
  }
};

// Login API
export const loginUser = async (username, password) => {
  const res = await api.post("/api/auth/login/", {
    username: username,
     password: password,
  });

  return res.data;
};

// Logout
export const logoutUser = () => {
  localStorage.clear();
  sessionStorage.clear();
};

// export const refreshToken = async (refresh) => { const response = await axios.post( `${API_URL}/auth/refresh/`, { refresh: refresh, } ); return response.data; };

