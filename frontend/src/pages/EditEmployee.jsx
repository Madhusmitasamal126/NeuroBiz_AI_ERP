
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
    employee_name: "",
    first_name: "",
    last_name: "",
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

  // LOAD EMPLOYEE DETAILS
  useEffect(() => {
    let isMounted = true;

    const loadEmployee = async () => {
      try {
        setLoading(true);
        setError("");

        const data = await getEmployee(id);

        if (!isMounted) return;

        // Support employee names stored directly
        // or through Django's related User model.
        const nestedUser =
          data.user && typeof data.user === "object"
            ? data.user
            : {};

        const firstName =
          data.first_name ??
          data.user_first_name ??
          nestedUser.first_name ??
          "";

        const lastName =
          data.last_name ??
          data.user_last_name ??
          nestedUser.last_name ??
          "";

        const employeeName =
          data.employee_name ??
          data.full_name ??
          data.name ??
          [
            firstName,
            lastName,
          ]
            .filter(Boolean)
            .join(" ");

        setFormData({
          employee_name: employeeName || "",
          first_name: firstName,
          last_name: lastName,

          user:
            typeof data.user === "object"
              ? data.user.id ?? ""
              : data.user ?? "",

          employee_id: data.employee_id ?? "",

          department:
            typeof data.department === "object"
              ? data.department.id ?? ""
              : data.department ?? "",

          designation: data.designation ?? "",
          salary: data.salary ?? "",
          joining_date: data.joining_date ?? "",
          is_active: data.is_active !== false,
        });
      } catch (err) {
        console.error("Load employee error:", err);

        if (isMounted) {
          setError(
            err.response?.data?.detail ||
              "Unable to load employee."
          );
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadEmployee();

    return () => {
      isMounted = false;
    };
  }, [id]);

  // HANDLE INPUT CHANGES
  const handleChange = (event) => {
    const {
      name,
      value,
      type,
      checked,
    } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  // SUBMIT UPDATED EMPLOYEE
  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");

    if (!formData.employee_name.trim()) {
      setError("Employee name is required.");
      return;
    }

    if (!String(formData.user).trim()) {
      setError("User ID is required.");
      return;
    }

    if (!formData.employee_id.trim()) {
      setError("Employee ID is required.");
      return;
    }

    if (!String(formData.department).trim()) {
      setError("Department ID is required.");
      return;
    }

    if (!formData.designation.trim()) {
      setError("Designation is required.");
      return;
    }

    if (
      formData.salary !== "" &&
      Number(formData.salary) < 0
    ) {
      setError("Salary cannot be negative.");
      return;
    }

    try {
      setSaving(true);

      const payload = {
        // These name fields must be supported by
        // your Django serializer/model.
        employee_name: formData.employee_name.trim(),

        user: Number(formData.user),
        employee_id: formData.employee_id.trim(),
        department: Number(formData.department),
        designation: formData.designation.trim(),
        salary:
          formData.salary === ""
            ? null
            : formData.salary,
        joining_date: formData.joining_date || null,
        is_active: formData.is_active,
      };

      await updateEmployee(id, payload);

      navigate("/employees", {
        state: {
          success: "Employee updated successfully.",
        },
      });
    } catch (err) {
      console.error("Update employee error:", err);

      const backendError = err.response?.data;

      if (
        backendError &&
        typeof backendError === "object"
      ) {
        const messages = Object.entries(backendError)
          .map(([field, message]) => {
            const readableMessage = Array.isArray(message)
              ? message.join(", ")
              : typeof message === "object"
                ? JSON.stringify(message)
                : String(message);

            return `${field}: ${readableMessage}`;
          })
          .join(" | ");

        setError(
          messages || "Unable to update employee."
        );
      } else {
        setError("Unable to update employee.");
      }
    } finally {
      setSaving(false);
    }
  };

  // LOADING SCREEN
  if (loading) {
    return (
      <div className="container-fluid p-4">
        <div className="text-center py-5">
          <div
            className="spinner-border text-primary"
            role="status"
            aria-label="Loading employee"
          />

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
      <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4">
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
          <i className="bi bi-arrow-left me-2" />
          Back to Employees
        </Link>
      </div>

      {/* ERROR MESSAGE */}
      {error && (
        <div
          className="alert alert-danger alert-dismissible fade show"
          role="alert"
        >
          {error}

          <button
            type="button"
            className="btn-close"
            aria-label="Close error"
            onClick={() => setError("")}
          />
        </div>
      )}

      {/* EMPLOYEE FORM */}
      <div className="card shadow-sm border-0">
        <div className="card-header bg-white py-3">
          <h5 className="mb-0 fw-bold">
            <i className="bi bi-person-gear me-2 text-primary" />
            Employee Details
          </h5>
        </div>

        <div className="card-body p-4">
          <form onSubmit={handleSubmit}>
            <div className="row g-3">
              {/* EMPLOYEE NAME */}
              <div className="col-md-6">
                <label
                  htmlFor="employee_name"
                  className="form-label fw-semibold"
                >
                  Employee Name{" "}
                  <span className="text-danger">*</span>
                </label>

                <input
                  id="employee_name"
                  type="text"
                  name="employee_name"
                  className="form-control"
                  placeholder="Enter employee full name"
                  value={formData.employee_name}
                  onChange={handleChange}
                  required
                />
              </div>

              {/* EMPLOYEE ID */}
              <div className="col-md-6">
                <label
                  htmlFor="employee_id"
                  className="form-label fw-semibold"
                >
                  Employee ID{" "}
                  <span className="text-danger">*</span>
                </label>

                <input
                  id="employee_id"
                  type="text"
                  name="employee_id"
                  className="form-control"
                  placeholder="e.g. EMP001"
                  value={formData.employee_id}
                  onChange={handleChange}
                  required
                />
              </div>

              {/* USER ID */}
              <div className="col-md-6">
                <label
                  htmlFor="user"
                  className="form-label fw-semibold"
                >
                  User ID{" "}
                  <span className="text-danger">*</span>
                </label>

                <input
                  id="user"
                  type="number"
                  name="user"
                  className="form-control"
                  placeholder="Enter Django user ID"
                  min="1"
                  value={formData.user}
                  onChange={handleChange}
                  required
                />

                <small className="text-muted">
                  This is the database ID of the linked user.
                </small>
              </div>

              {/* DEPARTMENT ID */}
              <div className="col-md-6">
                <label
                  htmlFor="department"
                  className="form-label fw-semibold"
                >
                  Department ID{" "}
                  <span className="text-danger">*</span>
                </label>

                <input
                  id="department"
                  type="number"
                  name="department"
                  className="form-control"
                  placeholder="Enter department ID"
                  min="1"
                  value={formData.department}
                  onChange={handleChange}
                  required
                />
              </div>

              {/* DESIGNATION */}
              <div className="col-md-6">
                <label
                  htmlFor="designation"
                  className="form-label fw-semibold"
                >
                  Designation{" "}
                  <span className="text-danger">*</span>
                </label>

                <input
                  id="designation"
                  type="text"
                  name="designation"
                  className="form-control"
                  placeholder="e.g. Python Developer"
                  value={formData.designation}
                  onChange={handleChange}
                  required
                />
              </div>

              {/* SALARY */}
              <div className="col-md-6">
                <label
                  htmlFor="salary"
                  className="form-label fw-semibold"
                >
                  Monthly Salary (₹)
                </label>

                <input
                  id="salary"
                  type="number"
                  name="salary"
                  className="form-control"
                  placeholder="Enter salary"
                  min="0"
                  step="0.01"
                  value={formData.salary}
                  onChange={handleChange}
                />
              </div>

              {/* JOINING DATE */}
              <div className="col-md-6">
                <label
                  htmlFor="joining_date"
                  className="form-label fw-semibold"
                >
                  Joining Date
                </label>

                <input
                  id="joining_date"
                  type="date"
                  name="joining_date"
                  className="form-control"
                  value={formData.joining_date}
                  onChange={handleChange}
                />
              </div>

              {/* STATUS */}
              <div className="col-12">
                <div className="card bg-light border-0 mt-2">
                  <div className="card-body py-3">
                    <div className="form-check form-switch">
                      <input
                        id="is_active"
                        type="checkbox"
                        name="is_active"
                        className="form-check-input"
                        role="switch"
                        checked={formData.is_active}
                        onChange={handleChange}
                      />

                      <label
                        htmlFor="is_active"
                        className="form-check-label fw-semibold"
                      >
                        Employee is active
                      </label>
                    </div>

                    <small className="text-muted">
                      Inactive employees can be retained
                      in the records without being marked active.
                    </small>
                  </div>
                </div>
              </div>
            </div>

            {/* FORM BUTTONS */}
            <div className="d-flex flex-wrap gap-2 mt-4">
              <button
                type="submit"
                className="btn btn-primary"
                disabled={saving}
              >
                {saving ? (
                  <>
                    <span
                      className="spinner-border spinner-border-sm me-2"
                      role="status"
                      aria-hidden="true"
                    />
                    Updating...
                  </>
                ) : (
                  <>
                    <i className="bi bi-check-circle me-2" />
                    Update Employee
                  </>
                )}
              </button>

              <Link
                to="/employees"
                className="btn btn-outline-secondary"
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
