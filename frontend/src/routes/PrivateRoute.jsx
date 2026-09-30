import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function PrivateRoute({ children }) {
  const { user, loading } = useAuth();

  // Wait until authentication status is checked
  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <div className="text-center">
          <div
            className="spinner-border text-primary"
            role="status"
          >
            <span className="visually-hidden">
              Loading...
            </span>
          </div>

          <p className="mt-3 text-muted">
            Loading...
          </p>
        </div>
      </div>
    );
  }

  // User logged in → allow dashboard
  if (user) {
    return children;
  }

  // User not logged in → go to login
  return <Navigate to="/" replace />;
}

export default PrivateRoute;