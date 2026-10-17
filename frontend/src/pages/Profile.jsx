
function Profile() {
  const username = localStorage.getItem("username");
  const email = localStorage.getItem("email");

  return (
    <div className="container py-5">

      <div className="row justify-content-center">

        <div className="col-md-8">

          <div className="card shadow-sm">

            <div className="card-header bg-primary text-white">
              <h4 className="mb-0">
                My Profile
              </h4>
            </div>

            <div className="card-body">

              <div className="mb-3">
                <label className="form-label fw-bold">
                  Username
                </label>

                <input
                  type="text"
                  className="form-control"
                  value={username || "User"}
                  readOnly
                />
              </div>

              <div className="mb-3">
                <label className="form-label fw-bold">
                  Email
                </label>

                <input
                  type="email"
                  className="form-control"
                  value={email || "Not available"}
                  readOnly
                />
              </div>

              <div className="mb-3">
                <label className="form-label fw-bold">
                  Account Status
                </label>

                <div>
                  <span className="badge bg-success">
                    Active
                  </span>
                </div>
              </div>

            </div>

          </div>

        </div>

      </div>

    </div>
  );
}

export default Profile;

