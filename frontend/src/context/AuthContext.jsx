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


    // =================================================
    // CHECK EXISTING LOGIN
    // =================================================

    useEffect(() => {

        const accessToken =
            localStorage.getItem("access_token") ||
            sessionStorage.getItem("access_token");


        if (accessToken) {

            setUser({
                loggedIn: true,
            });

        } else {

            setUser(null);

        }


        setLoading(false);

    }, []);


    // =================================================
    // LOGIN
    // =================================================

    const login = async (
        username,
        password,
        remember = false
    ) => {

        const data = await loginUser(
            username,
            password
        );


        console.log(
            "LOGIN DATA:",
            data
        );


        if (!data?.access) {

            throw new Error(
                "Access token was not received from Django."
            );

        }


        // =============================================
        // REMOVE OLD TOKENS
        // =============================================

        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");

        localStorage.removeItem("access");
        localStorage.removeItem("refresh");

        sessionStorage.removeItem("access_token");
        sessionStorage.removeItem("refresh_token");

        sessionStorage.removeItem("access");
        sessionStorage.removeItem("refresh");


        // =============================================
        // SAVE NEW TOKENS
        // =============================================

        if (remember) {

            localStorage.setItem(
                "access_token",
                data.access
            );

            localStorage.setItem(
                "refresh_token",
                data.refresh
            );

        } else {

            sessionStorage.setItem(
                "access_token",
                data.access
            );

            sessionStorage.setItem(
                "refresh_token",
                data.refresh
            );

        }


        console.log(
            "TOKEN SAVED:",
            remember
                ? localStorage.getItem("access_token")
                : sessionStorage.getItem("access_token")
        );


        // =============================================
        // SET USER
        // =============================================

        setUser({
            username: username,
            loggedIn: true,
        });


        return data;

    };


    // =================================================
    // LOGOUT
    // =================================================

    const logout = () => {

        logoutUser();

        setUser(null);

        window.location.href = "/login";

    };


    // =================================================
    // CONTEXT
    // =================================================

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