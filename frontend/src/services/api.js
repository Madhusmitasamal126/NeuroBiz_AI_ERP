import axios from "axios";


// =====================================================
// AXIOS API INSTANCE
// =====================================================

const api = axios.create({

    baseURL:
        import.meta.env.VITE_API_URL ||
        "http://127.0.0.1:8000",

    headers: {
        "Content-Type": "application/json",
    },

    timeout: 10000,

});


// =====================================================
// REQUEST INTERCEPTOR
// =====================================================
// Automatically adds JWT access token.
// Checks BOTH localStorage and sessionStorage.

api.interceptors.request.use(

    (config) => {

        const accessToken =
            localStorage.getItem("access_token") ||
            sessionStorage.getItem("access_token") ||
            localStorage.getItem("access") ||
            sessionStorage.getItem("access");


        console.log(
            "================================="
        );

        console.log(
            "API REQUEST:",
            config.method?.toUpperCase(),
            config.url
        );

        console.log(
            "JWT TOKEN EXISTS:",
            !!accessToken
        );


        if (accessToken) {

            config.headers.Authorization =
                `Bearer ${accessToken}`;

        }


        return config;

    },

    (error) => {

        return Promise.reject(error);

    }

);


// =====================================================
// RESPONSE INTERCEPTOR
// =====================================================

api.interceptors.response.use(

    (response) => {

        return response;

    },

    (error) => {

        if (
            error.response?.status === 401
        ) {

            console.error(
                "401 Unauthorized - JWT token is invalid or expired."
            );

            // Do NOT immediately clear the token here.
            // This prevents the token from being deleted
            // before we inspect the problem.
        }


        return Promise.reject(error);

    }

);


export default api;