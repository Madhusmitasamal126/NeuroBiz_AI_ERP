
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  getEmployees,
  deleteEmployee,
} from "../services/employee";

function Employees() {
  const [employees, setEmployees] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const employeesPerPage = 5;

  // Get a readable employee name from the API response.
  const getEmployeeName = (employee) => {
    // Check fields that may contain the complete name.
    const fullName =
      employee.employee_name ||
      employee.full_name ||
      employee.name ||
      employee.user_full_name;

    if (typeof fullName === "string" && fullName.trim()) {
      return fullName.trim();
    }

    // Handle separate first and last name fields.
    const firstName =
      employee.first_name ||
      employee.user_first_name ||
      "";

    const lastName =
      employee.last_name ||
      employee.user_last_name ||
      "";

    const combinedName = `${firstName} ${lastName}`.trim();

    if (combinedName) {
      return combinedName;
    }

    // Handle a nested Django user object.
    if (
      employee.user &&
      typeof employee.user === "object"
    ) {
      const nestedName = [
        employee.user.first_name,
        employee.user.last_name,
      ]
        .filter(Boolean)
        .join(" ")
        .trim();

      if (nestedName) {
        return nestedName;
      }

      if (employee.user.username) {
        return employee.user.username;
      }
    }

    // Last fallback: display the username.
    return (
      employee.username ||
      employee.user_name ||
      (typeof employee.user === "string"
        ? employee.user
        : "") ||
      "-"
    );
  };

  // Load employees from the backend.
  const loadEmployees = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await getEmployees();

      if (Array.isArray(data)) {
        setEmployees(data);
      } else if (Array.isArray(data?.results)) {
        setEmployees(data.results);
      } else {
        setEmployees([]);
      }
    } catch (err) {
      console.error("Employee loading error:", err);

      if (err.response?.status === 401) {
        setError(
          "Your session has expired. Please login again."
        );
      } else {
        setError(
          err.response?.data?.detail ||
            "Unable to load employees."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEmployees();
  }, []);

  // Search employees by name, ID, username,
  // department, or designation.
  const filteredEmployees = useMemo(() => {
    const keyword = search.toLowerCase().trim();

    if (!keyword) {
      return employees;
    }

    return employees.filter((employee) => {
      const employeeName = getEmployeeName(employee)
        .toLowerCase();

      const employeeId = String(
        employee.employee_id || ""
      ).toLowerCase();

      const username = String(
        employee.username ||
          employee.user_name ||
          (typeof employee.user === "string"
            ? employee.user
            : employee.user?.username) ||
          ""
      ).toLowerCase();

      const department = String(
        employee.department_name ||
          employee.department?.name ||
          employee.department ||
          ""
      ).toLowerCase();

      const designation = String(
        employee.designation || ""
      ).toLowerCase();

      return (
        employeeName.includes(keyword) ||
        employeeId.includes(keyword) ||
        username.includes(keyword) ||
        department.includes(keyword) ||
        designation.includes(keyword)
      );
    });
  }, [employees, search]);

  // Keep the current page valid after searching or deleting.
  const totalPages = Math.ceil(
    filteredEmployees.length / employeesPerPage
  );

  const startIndex =
    (currentPage - 1) * employeesPerPage;

  const currentEmployees = filteredEmployees.slice(
    startIndex,
    startIndex + employeesPerPage
  );

  // Delete employee.
  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this employee?"
    );

    if (!confirmed) return;

    try {
      setDeleteLoading(true);
      setDeletingId(id);
      setError("");
      setSuccess("");

      await deleteEmployee(id);

      const updatedEmployees = employees.filter(
        (employee) => employee.id !== id
      );

      setEmployees(updatedEmployees);

      const remainingCount = updatedEmployees.filter(
        (employee) => {
          const keyword = search.toLowerCase().trim();

          if (!keyword) return true;

          return [
            getEmployeeName(employee),
            employee.employee_id,
            employee.username,
            employee.user_name,
            employee.department_name,
            employee.designation,
          ]
            .filter(Boolean)
            .some((value) =>
              String(value).toLowerCase().includes(keyword)
            );
        }
      ).length;

      const newTotalPages = Math.ceil(
        remainingCount / employeesPerPage
      );

      if (
        currentPage > newTotalPages &&
        newTotalPages > 0
      ) {
        setCurrentPage(newTotalPages);
      }

      setSuccess("Employee deleted successfully.");
    } catch (err) {
      console.error("Delete employee error:", err);

      setError(
        err.response?.data?.detail ||
          "Unable to delete employee."
      );
    } finally {
      setDeleteLoading(false);
      setDeletingId(null);
    }
  };

  const handleSearchChange = (event) => {
    setSearch(event.target.value);
    setCurrentPage(1);
  };

  // Loading screen.
  if (loading) {
    return (
      <div className="container-fluid p-4">
        <div className="text-center py-5">
          <div
            className="spinner-border text-primary"
            role="status"
            aria-label="Loading employees"
          />

          <p className="mt-3 text-muted">
            Loading employees...
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
            Employees
          </h2>

          <p className="text-muted mb-0">
            Manage your organization employees
          </p>
        </div>

        <Link
          to="/employees/add"
          className="btn btn-primary"
        >
          <i className="bi bi-plus-lg me-2" />
          Add Employee
        </Link>
      </div>

      {/* SUCCESS MESSAGE */}
      {success && (
        <div
          className="alert alert-success alert-dismissible fade show"
          role="alert"
        >
          {success}

          <button
            type="button"
            className="btn-close"
            aria-label="Close success message"
            onClick={() => setSuccess("")}
          />
        </div>
      )}

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
            aria-label="Close error message"
            onClick={() => setError("")}
          />
        </div>
      )}

      {/* SEARCH CARD */}
      <div className="card shadow-sm border-0 mb-4">
        <div className="card-body">
          <div className="row align-items-center">
            <div className="col-md-6">
              <div className="input-group">
                <span className="input-group-text">
                  <i className="bi bi-search" />
                </span>

                <input
                  type="text"
                  className="form-control"
                  placeholder="Search by employee name, ID, username..."
                  value={search}
                  onChange={handleSearchChange}
                  aria-label="Search employees"
                />
              </div>
            </div>

            <div className="col-md-6 text-md-end mt-3 mt-md-0">
              <span className="text-muted">
                Total Employees:{" "}
                <strong>{filteredEmployees.length}</strong>
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* EMPLOYEE TABLE */}
      <div className="card shadow-sm border-0">
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th>#</th>
                  <th>Employee ID</th>
                  <th>Employee Name</th>
                  <th>Username</th>
                  <th>Department</th>
                  <th>Designation</th>
                  <th>Salary</th>
                  <th>Joining Date</th>
                  <th>Status</th>
                  <th className="text-center">Actions</th>
                </tr>
              </thead>

              <tbody>
                {currentEmployees.length === 0 ? (
                  <tr>
                    <td colSpan="10" className="text-center py-5">
                      <i className="bi bi-people fs-2 text-muted d-block mb-2" />

                      <div className="text-muted">
                        {search
                          ? "No employees match your search."
                          : "No employees found."}
                      </div>
                    </td>
                  </tr>
                ) : (
                  currentEmployees.map((employee, index) => (
                    <tr key={employee.id}>
                      <td>{startIndex + index + 1}</td>

                      <td>
                        <strong>
                          {employee.employee_id || "-"}
                        </strong>
                      </td>

                      <td>
                        <div className="d-flex align-items-center gap-2">
                          <div
                            className="rounded-circle bg-primary-subtle text-primary d-flex align-items-center justify-content-center fw-bold"
                            style={{
                              width: "38px",
                              height: "38px",
                              minWidth: "38px",
                            }}
                          >
                            {getEmployeeName(employee)
                              .charAt(0)
                              .toUpperCase()}
                          </div>

                          <span className="fw-semibold">
                            {getEmployeeName(employee)}
                          </span>
                        </div>
                      </td>

                      <td>
                        {employee.username ||
                          employee.user_name ||
                          employee.user?.username ||
                          (typeof employee.user === "string"
                            ? employee.user
                            : "-")}
                      </td>

                      <td>
                        {employee.department_name ||
                          employee.department?.name ||
                          employee.department ||
                          "-"}
                      </td>

                      <td>
                        {employee.designation || "-"}
                      </td>

                      <td>
                        ₹{" "}
                        {employee.salary != null &&
                        employee.salary !== ""
                          ? Number(
                              employee.salary
                            ).toLocaleString("en-IN")
                          : "0"}
                      </td>

                      <td>
                        {employee.joining_date
                          ? new Date(
                              employee.joining_date
                            ).toLocaleDateString("en-IN")
                          : "-"}
                      </td>

                      <td>
                        {employee.is_active !== false ? (
                          <span className="badge bg-success">
                            Active
                          </span>
                        ) : (
                          <span className="badge bg-danger">
                            Inactive
                          </span>
                        )}
                      </td>

                      <td>
                        <div className="d-flex justify-content-center gap-2">
                          <Link
                            to={`/employees/edit/${employee.id}`}
                            className="btn btn-sm btn-outline-primary"
                            title="Edit employee"
                            aria-label={`Edit ${getEmployeeName(employee)}`}
                          >
                            <i className="bi bi-pencil-square" />
                          </Link>

                          <button
                            type="button"
                            className="btn btn-sm btn-outline-danger"
                            onClick={() =>
                              handleDelete(employee.id)
                            }
                            disabled={deleteLoading}
                            title="Delete employee"
                            aria-label={`Delete ${getEmployeeName(employee)}`}
                          >
                            {deleteLoading &&
                            deletingId === employee.id ? (
                              <span
                                className="spinner-border spinner-border-sm"
                                role="status"
                                aria-label="Deleting"
                              />
                            ) : (
                              <i className="bi bi-trash" />
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* PAGINATION */}
        {totalPages > 1 && (
          <div className="card-footer bg-white">
            <div className="d-flex flex-wrap justify-content-between align-items-center gap-3">
              <small className="text-muted">
                Showing {startIndex + 1}–
                {Math.min(
                  startIndex + employeesPerPage,
                  filteredEmployees.length
                )}{" "}
                of {filteredEmployees.length} employees
              </small>

              <nav aria-label="Employee pagination">
                <ul className="pagination justify-content-end mb-0">
                  <li
                    className={`page-item ${
                      currentPage === 1 ? "disabled" : ""
                    }`}
                  >
                    <button
                      type="button"
                      className="page-link"
                      onClick={() =>
                        setCurrentPage((page) =>
                          Math.max(1, page - 1)
                        )
                      }
                      disabled={currentPage === 1}
                    >
                      Previous
                    </button>
                  </li>

                  {Array.from(
                    { length: totalPages },
                    (_, index) => index + 1
                  ).map((page) => (
                    <li
                      key={page}
                      className={`page-item ${
                        currentPage === page ? "active" : ""
                      }`}
                    >
                      <button
                        type="button"
                        className="page-link"
                        onClick={() => setCurrentPage(page)}
                        aria-current={
                          currentPage === page ? "page" : undefined
                        }
                      >
                        {page}
                      </button>
                    </li>
                  ))}

                  <li
                    className={`page-item ${
                      currentPage === totalPages ? "disabled" : ""
                    }`}
                  >
                    <button
                      type="button"
                      className="page-link"
                      onClick={() =>
                        setCurrentPage((page) =>
                          Math.min(totalPages, page + 1)
                        )
                      }
                      disabled={currentPage === totalPages}
                    >
                      Next
                    </button>
                  </li>
                </ul>
              </nav>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Employees;
