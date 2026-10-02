import { useEffect, useState } from "react";
import {
  Link,
  useNavigate,
  useParams,
} from "react-router-dom";

import {
  getEmployee,
  updateEmployee,
} from "../services/employee";

function EditEmployee() {
  const { id } = useParams();
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

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");

  // ==========================
  // LOAD EMPLOYEE
  // ==========================

  useEffect(() => {
    const loadEmployee = async () => {
      try {
        setLoading(true);
        setError("");

        const data = await getEmployee(id);

        setFormData({
          user: data.user ?? "",
          employee_id:
            data.employee_id ?? "",
          department:
            data.department ?? "",
          designation:
            data.designation ?? "",
          salary:
            data.salary ?? "",
          joining_date:
            data.joining_date ?? "",
          is_active:
            data.is_active !== false,
        });
      } catch (err) {
        console.error(
          "Load employee error:",
          err
        );

        setError(
          err.response?.data?.detail ||
            "Unable to load employee."
        );
      } finally {
        setLoading(false);
      }
    };

    loadEmployee();
  }, [id]);

  // ==========================
  // HANDLE CHANGE
  // ==========================

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

  // ==========================
  // SUBMIT
  // ==========================

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");

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

    try {
      setSaving(true);

      const payload = {
        user: Number(formData.user),
        employee_id:
          formData.employee_id.trim(),
        department:
          Number(formData.department),
        designation:
          formData.designation.trim(),
        salary: formData.salary,
        joining_date:
          formData.joining_date,
        is_active:
          formData.is_active,
      };

      await updateEmployee(id, payload);

      navigate("/employees", {
        state: {
          success:
            "Employee updated successfully.",
        },
      });
    } catch (err) {
      console.error(
        "Update employee error:",
        err
      );

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
          messages ||
            "Unable to update employee."
        );
      } else {
        setError(
          "Unable to update employee."
        );
      }
    } finally {
      setSaving(false);
    }
  };

  // ==========================
  // LOADING
  // ==========================

  if (loading) {
    return (
      <div className="container-fluid p-4">
        <div className="text-center py-5">

          <div
            className="spinner-border text-primary"
            role="status"
          ></div>

          <p className="text-muted mt-3">
            Loading employee...
          </p>

        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid p-4">

      {/* HEADER */}

      <div className="d-flex justify-content-between align-items-center mb-4">

        <div>

          <h2 className="fw-bold mb-1">
            Edit Employee
          </h2>

          <p className="text-muted mb-0">
            Update employee information
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
                  value={formData.user}
                  onChange={handleChange}
                />

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
                  value={formData.department}
                  onChange={handleChange}
                />

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

              {/* STATUS */}

              <div className="col-12">

                <div className="form-check">

                  <input
                    type="checkbox"
                    name="is_active"
                    id="is_active"
                    className="form-check-input"
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
                disabled={saving}
              >

                {saving ? (
                  <>
                    <span
                      className="spinner-border spinner-border-sm me-2"
                    ></span>

                    Updating...
                  </>
                ) : (
                  "Update Employee"
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

export default EditEmployee;