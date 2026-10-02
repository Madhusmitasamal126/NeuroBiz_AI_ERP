
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

import { useAuth } from "../context/AuthContext";

function Login() {
  const navigate = useNavigate();

  const { login } = useAuth();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");

    const cleanUsername = username.trim();

    if (!cleanUsername) {
      setError("Please enter your username.");
      return;
    }

    if (!password) {
      setError("Please enter your password.");
      return;
    }

    setLoading(true);

    try {
      console.log("Starting login...");

      // Login through AuthContext
      const data = await login(
        cleanUsername,
        password,
        remember
      );

      console.log("Login successful:", data);

      // Automatically open dashboard
      navigate("/dashboard", {
        replace: true,
      });

    } catch (err) {
      console.error("Login failed:", err);

      if (err.response?.status === 401) {
        setError("Invalid username or password.");
      } else if (err.response?.status === 400) {
        setError(
          err.response?.data?.detail ||
          err.response?.data?.non_field_errors?.[0] ||
          "Invalid login details."
        );
      } else if (!err.response) {
        setError(
          "Cannot connect to Django server. Make sure Django is running."
        );
      } else {
        setError(
          err.response?.data?.detail ||
          "Login failed. Please try again."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-bg">
      <div className="container">
        <div className="row vh-100 justify-content-center align-items-center">

          <div className="col-12 col-sm-10 col-md-6 col-lg-5">

            <div className="card shadow-lg border-0 rounded-4 p-4">

              {/* Header */}
              <div className="text-center mb-4">

                <h2 className="text-primary fw-bold">
                  NeuroBiz AI ERP
                </h2>

                <p className="text-muted">
                  Enterprise Business Intelligence
                </p>

              </div>

              {/* Error */}
              {error && (
                <div
                  className="alert alert-danger"
                  role="alert"
                >
                  {error}
                </div>
              )}

              {/* Login Form */}
              <form onSubmit={handleSubmit}>

                {/* Username */}
                <div className="mb-3">

                  <label
                    htmlFor="username"
                    className="form-label fw-semibold"
                  >
                    Username
                  </label>

                  <input
                    id="username"
                    type="text"
                    className="form-control form-control-lg"
                    placeholder="Enter username"
                    value={username}
                    onChange={(e) => {
                      setUsername(e.target.value);
                      setError("");
                    }}
                    disabled={loading}
                    autoComplete="username"
                    autoFocus
                  />

                </div>

                {/* Password */}
                <div className="mb-3">

                  <label
                    htmlFor="password"
                    className="form-label fw-semibold"
                  >
                    Password
                  </label>

                  <input
                    id="password"
                    type="password"
                    className="form-control form-control-lg"
                    placeholder="Enter password"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      setError("");
                    }}
                    disabled={loading}
                    autoComplete="current-password"
                  />

                </div>

                {/* Remember Me */}
                <div className="form-check mb-4">

                  <input
                    id="rememberMe"
                    type="checkbox"
                    className="form-check-input"
                    checked={remember}
                    onChange={(e) =>
                      setRemember(e.target.checked)
                    }
                    disabled={loading}
                  />

                  <label
                    htmlFor="rememberMe"
                    className="form-check-label"
                  >
                    Remember Me
                  </label>

                </div>

                {/* Login Button */}
                <button
                  type="submit"
                  className="btn btn-primary btn-lg w-100"
                  disabled={loading}
                >

                  {loading ? (
                    <>
                      <span
                        className="spinner-border spinner-border-sm me-2"
                        role="status"
                      />

                      Signing In...
                    </>
                  ) : (
                    "Login"
                  )}

                </button>

              </form>

              {/* Register */}
              <div className="text-center mt-4">

                <span className="text-muted">
                  Don't have an account?{" "}
                </span>

                <Link
                  to="/register"
                  className="text-primary fw-semibold text-decoration-none"
                >
                  Create Account
                </Link>

              </div>

              <hr className="my-4" />

              <p className="text-center text-muted mb-0">
                © 2026 NeuroBiz AI ERP
              </p>

            </div>

          </div>

        </div>
      </div>
    </div>
  );
}

export default Login;

