import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { registerUser } from "../services/auth";

export default function Registration() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    password2: "",
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setMessage("");

    if (form.password !== form.password2) {
      setError("Passwords do not match");
      return;
    }

    try {
      setLoading(true);

      await registerUser({
        username: form.username,
        email: form.email,
        password: form.password,
        password2: form.password2,
      });

      setMessage("Registration successful!");

      setTimeout(() => {
        navigate("/login");
      }, 1500);

    } catch (err) {
      if (err.response?.data) {
        setError(JSON.stringify(err.response.data));
      } else {
        setError("Registration failed");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-md-5">

          <div className="card shadow p-4">
            <h2 className="text-center mb-4">Create Account</h2>

            {message && (
              <div className="alert alert-success">{message}</div>
            )}

            {error && (
              <div className="alert alert-danger">{error}</div>
            )}

            <form onSubmit={handleSubmit}>

              <div className="mb-3">
                <label>Username</label>
                <input
                  type="text"
                  name="username"
                  className="form-control"
                  value={form.username}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="mb-3">
                <label>Email</label>
                <input
                  type="email"
                  name="email"
                  className="form-control"
                  value={form.email}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="mb-3">
                <label>Password</label>
                <input
                  type="password"
                  name="password"
                  className="form-control"
                  value={form.password}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="mb-3">
                <label>Confirm Password</label>
                <input
                  type="password"
                  name="password2"
                  className="form-control"
                  value={form.password2}
                  onChange={handleChange}
                  required
                />
              </div>

              <button
                className="btn btn-primary w-100"
                disabled={loading}
              >
                {loading ? "Creating..." : "Register"}
              </button>

            </form>

            <p className="text-center mt-3">
              Already have an account?{" "}
              <Link to="/login">Login</Link>
            </p>

          </div>

        </div>
      </div>
    </div>
  );
}