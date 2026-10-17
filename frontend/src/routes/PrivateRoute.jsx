
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function PrivateRoute({ children }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  // =====================================
  // CHECKING AUTHENTICATION
  // =====================================
  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <div className="text-center">

          <div
            className="spinner-border text-primary"
            role="status"
            aria-hidden="true"
          ></div>

          <p className="mt-3 text-muted">
            Checking authentication...
          </p>

        </div>
      </div>
    );
  }

  // =====================================
  // USER IS NOT LOGGED IN
  // =====================================
  if (!user) {
    return (
      <Navigate
        to="/login"
        replace
        state={{ from: location }}
      />
    );
  }

  // =====================================
  // USER IS LOGGED IN
  // =====================================
  return children;
}

export default PrivateRoute;

