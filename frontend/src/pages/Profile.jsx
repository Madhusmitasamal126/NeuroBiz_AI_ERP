
import { useCallback, useEffect, useState } from "react";
import api from "../services/api";

function Profile() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchProfile = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response = await api.get("profile/");
      setProfile(response.data);
    } catch (err) {
      console.error("Profile loading failed:", err);

      if (err.response?.status === 401) {
        setError("Your session has expired. Please sign in again.");
      } else if (err.response?.status === 403) {
        setError("You do not have permission to view this profile.");
      } else if (err.response?.status === 404) {
        setError(
          "Profile API not found. Check the Django profile URL configuration."
        );
      } else if (!err.response) {
        setError(
          "Cannot connect to Django. Make sure the backend is running."
        );
      } else {
        setError("Unable to load your profile. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const fullName = [
    profile?.first_name,
    profile?.last_name,
  ]
    .filter(Boolean)
    .join(" ");

  const role = profile?.is_staff ? "Admin / Staff" : "Employee";

  const joinedDate = profile?.date_joined
    ? new Date(profile.date_joined).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      })
    : "Not available";

  if (loading) {
    return (
      <div className="container py-5 text-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-3 text-muted">Loading your profile...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container py-5">
        <div className="alert alert-danger" role="alert">
          <h5>Profile unavailable</h5>
          <p className="mb-3">{error}</p>
          <button
            className="btn btn-primary"
            onClick={fetchProfile}
            type="button"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-4 py-md-5">
      <div className="row justify-content-center">
        <div className="col-12 col-lg-9">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <div>
              <h2 className="fw-bold mb-1">My Profile</h2>
              <p className="text-muted mb-0">
                Your account information from NeuroBiz AI ERP
              </p>
            </div>

            <button
              type="button"
              className="btn btn-outline-primary"
              onClick={fetchProfile}
            >
              &#8635; Refresh
            </button>
          </div>

          <div className="card border-0 shadow-sm rounded-4 overflow-hidden">
            <div className="bg-primary text-white p-4 p-md-5">
              <div className="d-flex align-items-center gap-3">
                <div
                  className="rounded-circle bg-white text-primary d-flex align-items-center justify-content-center fw-bold"
                  style={{
                    width: 76,
                    height: 76,
                    fontSize: 28,
                    flexShrink: 0,
                  }}
                >
                  {(fullName || profile.username || "U")
                    .charAt(0)
                    .toUpperCase()}
                </div>

                <div>
                  <h3 className="mb-1">
                    {fullName || profile.username}
                  </h3>
                  <div className="opacity-75">
                    {profile.email || "Email not provided"}
                  </div>
                  <span className="badge bg-light text-primary mt-2">
                    {role}
                  </span>
                </div>
              </div>
            </div>

            <div className="card-body p-4 p-md-5">
              <h5 className="fw-bold mb-4">Personal Information</h5>

              <div className="row g-4">
                <div className="col-md-6">
                  <label className="form-label text-muted">
                    Username
                  </label>
                  <div className="form-control bg-light">
                    {profile.username || "Not available"}
                  </div>
                </div>

                <div className="col-md-6">
                  <label className="form-label text-muted">
                    Email Address
                  </label>
                  <div className="form-control bg-light text-break">
                    {profile.email || "Not provided"}
                  </div>
                </div>

                <div className="col-md-6">
                  <label className="form-label text-muted">
                    First Name
                  </label>
                  <div className="form-control bg-light">
                    {profile.first_name || "Not provided"}
                  </div>
                </div>

                <div className="col-md-6">
                  <label className="form-label text-muted">
                    Last Name
                  </label>
                  <div className="form-control bg-light">
                    {profile.last_name || "Not provided"}
                  </div>
                </div>

                <div className="col-md-6">
                  <label className="form-label text-muted">
                    Account Role
                  </label>
                  <div className="form-control bg-light">{role}</div>
                </div>

                <div className="col-md-6">
                  <label className="form-label text-muted">
                    Account Status
                  </label>
                  <div className="form-control bg-light">
                    <span
                      className={`badge ${
                        profile.is_active ? "bg-success" : "bg-danger"
                      }`}
                    >
                      {profile.is_active ? "Active" : "Inactive"}
                    </span>
                  </div>
                </div>

                <div className="col-md-6">
                  <label className="form-label text-muted">
                    Account Created
                  </label>
                  <div className="form-control bg-light">
                    {joinedDate}
                  </div>
                </div>

                <div className="col-md-6">
                  <label className="form-label text-muted">
                    User ID
                  </label>
                  <div className="form-control bg-light">
                    {profile.id}
                  </div>
                </div>
              </div>

              <div className="alert alert-info mt-4 mb-0">
                <strong>Note:</strong> Your profile information is retrieved
                from the database. Contact your administrator if any account
                information needs to be changed.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Profile;
