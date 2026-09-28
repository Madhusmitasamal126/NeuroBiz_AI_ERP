import { useAuth } from "../context/AuthContext";

function Dashboard() {
  const { logout } = useAuth();

  return (
    <div className="container mt-4">
      <div className="d-flex justify-content-between align-items-center">
        <div>
          <h2 className="fw-bold text-primary">
            NeuroBiz Dashboard
          </h2>
          <p className="text-muted">
            Welcome to Enterprise ERP
          </p>
        </div>

        <button
          className="btn btn-danger"
          onClick={logout}
        >
          Logout
        </button>
      </div>

      <div className="row mt-4">
        <div className="col-md-3">
          <div className="card p-3 shadow-sm">
            <h6>Total Employees</h6>
            <h2>120</h2>
          </div>
        </div>

        <div className="col-md-3">
          <div className="card p-3 shadow-sm">
            <h6>Departments</h6>
            <h2>8</h2>
          </div>
        </div>

        <div className="col-md-3">
          <div className="card p-3 shadow-sm">
            <h6>Attendance</h6>
            <h2>96%</h2>
          </div>
        </div>

        <div className="col-md-3">
          <div className="card p-3 shadow-sm">
            <h6>Revenue</h6>
            <h2>₹4.5L</h2>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;