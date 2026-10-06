import api from "./api";


// =====================================================
// REGISTER
// =====================================================

export const registerUser = async (
    userData
) => {

    const response = await api.post(
        "/api/accounts/register/",
        userData
    );

    return response.data;

};


// =====================================================
// LOGIN
// =====================================================

export const loginUser = async (
    username,
    password
) => {

    const response = await api.post(
        "/api/auth/login/",
        {
            username: username,
            password: password,
        }
    );


    console.log(
        "LOGIN RESPONSE:",
        response.data
    );


    return response.data;

};


// =====================================================
// LOGOUT
// =====================================================

export const logoutUser = () => {

    // Local storage
    localStorage.removeItem(
        "access_token"
    );

    localStorage.removeItem(
        "refresh_token"
    );

    localStorage.removeItem(
        "access"
    );

    localStorage.removeItem(
        "refresh"
    );


    // Session storage
    sessionStorage.removeItem(
        "access_token"
    );

    sessionStorage.removeItem(
        "refresh_token"
    );

    sessionStorage.removeItem(
        "access"
    );

    sessionStorage.removeItem(
        "refresh"
    );

};