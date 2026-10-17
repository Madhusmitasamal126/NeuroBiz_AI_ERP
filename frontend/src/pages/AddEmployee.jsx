import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { createEmployee } from "../services/employee";

function AddEmployee() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    user: "",
    employee_id: "",
    department: "",
    designation: "",
    salary: "",
    joining_date: "",
    is_active: true,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (event) => {
    const { name, value, type, checked } =
      event.target;

    setFormData((previous) => ({
      ...previous,
      [name]:
        type === "checkbox"
          ? checked
          : value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");

    // Basic validation
    if (!formData.user) {
      setError("User ID is required.");
      return;
    }

    if (!formData.employee_id.trim()) {
      setError("Employee ID is required.");
      return;
    }

    if (!formData.department) {
      setError("Department is required.");
      return;
    }

    if (!formData.designation.trim()) {
      setError("Designation is required.");
      return;
    }

    if (!formData.salary) {
      setError("Salary is required.");
      return;
    }

    if (!formData.joining_date) {
      setError("Joining date is required.");
      return;
    }

    try {
      setLoading(true);

      const payload = {
        user: Number(formData.user),
        employee_id: formData.employee_id.trim(),
        department: Number(formData.department),
        designation: formData.designation.trim(),
        salary: formData.salary,
        joining_date: formData.joining_date,
        is_active: formData.is_active,
      };

      await createEmployee(payload);

      navigate("/employees", {
        state: {
          success:
            "Employee created successfully.",
        },
      });
    } catch (err) {
      console.error("Create employee error:", err);

      const backendError =
        err.response?.data;

      if (
        backendError &&
        typeof backendError === "object"
      ) {
        const messages = Object.entries(
          backendError
        )
          .map(
            ([field, message]) =>
              `${field}: ${
                Array.isArray(message)
                  ? message.join(", ")
                  : message
              }`
          )
          .join(" | ");

        setError(
          messages || "Unable to create employee."
        );
      } else {
        setError(
          "Unable to create employee."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-fluid p-4">

      {/* HEADER */}

      <div className="d-flex justify-content-between align-items-center mb-4">

        <div>
          <h2 className="fw-bold mb-1">
            Add Employee
          </h2>

          <p className="text-muted mb-0">
            Create a new employee record
          </p>
        </div>

        <Link
          to="/employees"
          className="btn btn-outline-secondary"
        >
          ← Back
        </Link>

      </div>

      {/* ERROR */}

      {error && (
        <div className="alert alert-danger">
          {error}
        </div>
      )}

      {/* FORM */}

      <div className="card shadow-sm border-0">

        <div className="card-body p-4">

          <form onSubmit={handleSubmit}>

            <div className="row g-3">

              {/* USER */}

              <div className="col-md-6">

                <label className="form-label fw-semibold">
                  User ID
                </label>

                <input
                  type="number"
                  name="user"
                  className="form-control"
                  placeholder="Enter Django User ID"
                  value={formData.user}
                  onChange={handleChange}
                />

                <small className="text-muted">
                  Enter the existing Django user ID.
                </small>

              </div>

              {/* EMPLOYEE ID */}

              <div className="col-md-6">

                <label className="form-label fw-semibold">
                  Employee ID
                </label>

                <input
                  type="text"
                  name="employee_id"
                  className="form-control"
                  placeholder="Example: EMP001"
                  value={formData.employee_id}
                  onChange={handleChange}
                />

              </div>

              {/* DEPARTMENT */}

              <div className="col-md-6">

                <label className="form-label fw-semibold">
                  Department ID
                </label>

                <input
                  type="number"
                  name="department"
                  className="form-control"
                  placeholder="Enter Department ID"
                  value={formData.department}
                  onChange={handleChange}
                />

                <small className="text-muted">
                  Enter the existing department ID.
                </small>

              </div>

              {/* DESIGNATION */}

              <div className="col-md-6">

                <label className="form-label fw-semibold">
                  Designation
                </label>

                <input
                  type="text"
                  name="designation"
                  className="form-control"
                  placeholder="Example: Python Developer"
                  value={formData.designation}
                  onChange={handleChange}
                />

              </div>

              {/* SALARY */}

              <div className="col-md-6">

                <label className="form-label fw-semibold">
                  Salary
                </label>

                <input
                  type="number"
                  name="salary"
                  className="form-control"
                  placeholder="Example: 45000"
                  min="0"
                  step="0.01"
                  value={formData.salary}
                  onChange={handleChange}
                />

              </div>

              {/* JOINING DATE */}

              <div className="col-md-6">

                <label className="form-label fw-semibold">
                  Joining Date
                </label>

                <input
                  type="date"
                  name="joining_date"
                  className="form-control"
                  value={formData.joining_date}
                  onChange={handleChange}
                />

              </div>

              {/* ACTIVE */}

              <div className="col-12">

                <div className="form-check">

                  <input
                    type="checkbox"
                    name="is_active"
                    className="form-check-input"
                    id="is_active"
                    checked={formData.is_active}
                    onChange={handleChange}
                  />

                  <label
                    htmlFor="is_active"
                    className="form-check-label"
                  >
                    Employee is active
                  </label>

                </div>

              </div>

            </div>

            {/* BUTTONS */}

            <div className="d-flex gap-2 mt-4">

              <button
                type="submit"
                className="btn btn-primary"
                disabled={loading}
              >

                {loading ? (
                  <>
                    <span
                      className="spinner-border spinner-border-sm me-2"
                    ></span>

                    Saving...
                  </>
                ) : (
                  "Save Employee"
                )}

              </button>

              <Link
                to="/employees"
                className="btn btn-secondary"
              >
                Cancel
              </Link>

            </div>

          </form>

        </div>

      </div>

    </div>
  );
}

export default AddEmployee;