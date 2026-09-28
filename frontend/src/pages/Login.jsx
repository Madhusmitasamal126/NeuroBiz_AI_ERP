import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { loginUser } from "../services/auth";

function Login() {
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);
    setError("");

    try {
      const data = await loginUser(username, password);

      if (remember) {
        localStorage.setItem("access", data.access);
        localStorage.setItem("refresh", data.refresh);
      } else {
        sessionStorage.setItem("access", data.access);
        sessionStorage.setItem("refresh", data.refresh);
      }

      console.log("Login Success");
      navigate("/dashboard");
    } catch (err) {
      console.log(err.response?.data);
      setError("Invalid username or password");
    } finally {
      setLoading(false);
    }
  };



  return (
    <div className="login-bg">
      <div className="container">
        <div className="row vh-100 justify-content-center align-items-center">
          <div className="col-md-5">
            <div className="card shadow-lg p-4 border-0 rounded-4">
              <h2 className="text-center text-primary fw-bold">
                NeuroBiz AI ERP
              </h2>

              <p className="text-center text-muted">
                Enterprise Login
              </p>

              {error && (
                <div className="alert alert-danger">{error}</div>
              )}

              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label className="form-label">Username</label>

                  <input
                    className="form-control"
                    value={username}
                    onChange={(e) =>
                      setUsername(e.target.value)
                    }
                    required
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label">Password</label>

                  <input
                    type="password"
                    className="form-control"
                    value={password}
                    onChange={(e) =>
                      setPassword(e.target.value)
                    }
                    required
                  />
                </div>

                <div className="form-check mb-3">
                  <input
                    type="checkbox"
                    className="form-check-input"
                    checked={remember}
                    onChange={(e) =>
                      setRemember(e.target.checked)
                    }
                  />

                  <label className="form-check-label">
                    Remember Me
                  </label>
                </div>

                <button
                  className="btn btn-primary w-100"
                  disabled={loading}
                >
                  {loading
                    ? "Signing In..."
                    : "Login"}
                </button>
              </form>

              <hr />

              <p className="text-center text-muted mb-0">
                © 2026 NeuroBiz ERP
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;