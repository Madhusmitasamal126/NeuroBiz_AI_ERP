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

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [currentPage, setCurrentPage] = useState(1);

  const employeesPerPage = 5;

  // ==========================
  // LOAD EMPLOYEES
  // ==========================

  const loadEmployees = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await getEmployees();

      /*
        Django REST Framework may return:

        [
          {...},
          {...}
        ]

        OR

        {
          count: 10,
          results: [...]
        }
      */

      if (Array.isArray(data)) {
        setEmployees(data);
      } else if (Array.isArray(data.results)) {
        setEmployees(data.results);
      } else {
        setEmployees([]);
      }
    } catch (err) {
      console.error("Employee loading error:", err);

      if (err.response?.status === 401) {
        setError("Your session has expired. Please login again.");
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

  // ==========================
  // SEARCH
  // ==========================

  const filteredEmployees = useMemo(() => {
    const keyword = search.toLowerCase().trim();

    if (!keyword) {
      return employees;
    }

    return employees.filter((employee) => {
      const employeeId = String(
        employee.employee_id || ""
      ).toLowerCase();

      const designation = String(
        employee.designation || ""
      ).toLowerCase();

      const department = String(
        employee.department_name ||
          employee.department ||
          ""
      ).toLowerCase();

      const username = String(
        employee.username ||
          employee.user_name ||
          employee.user ||
          ""
      ).toLowerCase();

      return (
        employeeId.includes(keyword) ||
        designation.includes(keyword) ||
        department.includes(keyword) ||
        username.includes(keyword)
      );
    });
  }, [employees, search]);

  // ==========================
  // PAGINATION
  // ==========================

  const totalPages = Math.ceil(
    filteredEmployees.length / employeesPerPage
  );

  const startIndex =
    (currentPage - 1) * employeesPerPage;

  const currentEmployees = filteredEmployees.slice(
    startIndex,
    startIndex + employeesPerPage
  );

  // ==========================
  // DELETE
  // ==========================

  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this employee?"
    );

    if (!confirmed) {
      return;
    }

    try {
      setDeleteLoading(true);
      setError("");
      setSuccess("");

      await deleteEmployee(id);

      setEmployees((previousEmployees) =>
        previousEmployees.filter(
          (employee) => employee.id !== id
        )
      );

      setSuccess("Employee deleted successfully.");

      setTimeout(() => {
        setSuccess("");
      }, 3000);
    } catch (err) {
      console.error("Delete employee error:", err);

      setError(
        err.response?.data?.detail ||
          "Unable to delete employee."
      );
    } finally {
      setDeleteLoading(false);
    }
  };

  // ==========================
  // SEARCH CHANGE
  // ==========================

  const handleSearchChange = (event) => {
    setSearch(event.target.value);
    setCurrentPage(1);
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
      <div className="d-flex justify-content-between align-items-center mb-4">

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
          <i className="bi bi-plus-lg me-2"></i>
          Add Employee
        </Link>

      </div>

      {/* SUCCESS */}
      {success && (
        <div
          className="alert alert-success alert-dismissible fade show"
          role="alert"
        >
          {success}

          <button
            type="button"
            className="btn-close"
            onClick={() => setSuccess("")}
          ></button>
        </div>
      )}

      {/* ERROR */}
      {error && (
        <div
          className="alert alert-danger alert-dismissible fade show"
          role="alert"
        >
          {error}

          <button
            type="button"
            className="btn-close"
            onClick={() => setError("")}
          ></button>
        </div>
      )}

      {/* SEARCH CARD */}
      <div className="card shadow-sm border-0 mb-4">
        <div className="card-body">

          <div className="row align-items-center">

            <div className="col-md-6">

              <div className="input-group">

                <span className="input-group-text">
                  🔍
                </span>

                <input
                  type="text"
                  className="form-control"
                  placeholder="Search employee..."
                  value={search}
                  onChange={handleSearchChange}
                />

              </div>

            </div>

            <div className="col-md-6 text-md-end mt-3 mt-md-0">

              <span className="text-muted">
                Total Employees:{" "}
                <strong>
                  {filteredEmployees.length}
                </strong>
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
                  <th>User</th>
                  <th>Department</th>
                  <th>Designation</th>
                  <th>Salary</th>
                  <th>Joining Date</th>
                  <th>Status</th>
                  <th className="text-center">
                    Actions
                  </th>
                </tr>

              </thead>

              <tbody>

                {currentEmployees.length === 0 ? (

                  <tr>
                    <td
                      colSpan="9"
                      className="text-center py-5"
                    >
                      <div className="text-muted">
                        No employees found.
                      </div>
                    </td>
                  </tr>

                ) : (

                  currentEmployees.map(
                    (employee, index) => (

                      <tr key={employee.id}>

                        <td>
                          {startIndex + index + 1}
                        </td>

                        <td>
                          <strong>
                            {employee.employee_id || "-"}
                          </strong>
                        </td>

                        <td>
                          {employee.username ||
                            employee.user_name ||
                            employee.user ||
                            "-"}
                        </td>

                        <td>
                          {employee.department_name ||
                            employee.department ||
                            "-"}
                        </td>

                        <td>
                          {employee.designation || "-"}
                        </td>

                        <td>
                          ₹{" "}
                          {employee.salary
                            ? Number(
                                employee.salary
                              ).toLocaleString("en-IN")
                            : "0"}
                        </td>

                        <td>
                          {employee.joining_date
                            ? new Date(
                                employee.joining_date
                              ).toLocaleDateString(
                                "en-IN"
                              )
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
                              title="Edit"
                            >
                              ✏️
                            </Link>

                            <button
                              type="button"
                              className="btn btn-sm btn-outline-danger"
                              onClick={() =>
                                handleDelete(
                                  employee.id
                                )
                              }
                              disabled={deleteLoading}
                              title="Delete"
                            >
                              🗑️
                            </button>

                          </div>

                        </td>

                      </tr>

                    )
                  )

                )}

              </tbody>

            </table>

          </div>

        </div>

        {/* PAGINATION */}
        {totalPages > 1 && (

          <div className="card-footer bg-white">

            <nav>

              <ul className="pagination justify-content-end mb-0">

                <li
                  className={`page-item ${
                    currentPage === 1
                      ? "disabled"
                      : ""
                  }`}
                >

                  <button
                    className="page-link"
                    onClick={() =>
                      setCurrentPage(
                        currentPage - 1
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
                      currentPage === page
                        ? "active"
                        : ""
                    }`}
                  >

                    <button
                      className="page-link"
                      onClick={() =>
                        setCurrentPage(page)
                      }
                    >
                      {page}
                    </button>

                  </li>

                ))}

                <li
                  className={`page-item ${
                    currentPage === totalPages
                      ? "disabled"
                      : ""
                  }`}
                >

                  <button
                    className="page-link"
                    onClick={() =>
                      setCurrentPage(
                        currentPage + 1
                      )
                    }
                    disabled={
                      currentPage === totalPages
                    }
                  >
                    Next
                  </button>

                </li>

              </ul>

            </nav>

          </div>

        )}

      </div>

    </div>
  );
}

export default Employees;