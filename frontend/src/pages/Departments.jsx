import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import Sidebar from "../components/Sidebar";
import departmentService from "../services/departmentService";

function Departments() {
    const navigate = useNavigate();

    const [departments, setDepartments] = useState([]);
    const [name, setName] = useState("");
    const [location, setLocation] = useState("");

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    // =========================
    // LOAD DEPARTMENTS
    // =========================
    const loadDepartments = async () => {
        try {
            setLoading(true);
            setError("");

            const data = await departmentService.getDepartments();

            setDepartments(
                Array.isArray(data)
                    ? data
                    : data?.results || []
            );
        } catch (error) {
            console.error("Load departments error:", error);

            setError(
                error.response?.data?.detail ||
                "Unable to load departments. Please check your backend server."
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadDepartments();
    }, []);

    // =========================
    // ADD DEPARTMENT
    // =========================
    const addDepartment = async (e) => {
        e.preventDefault();

        setError("");
        setSuccess("");

        if (!name.trim()) {
            setError("Department name is required.");
            return;
        }

        try {
            setSaving(true);

            await departmentService.createDepartment({
                name: name.trim(),
                location: location.trim(),
            });

            setName("");
            setLocation("");

            setSuccess("Department created successfully.");

            await loadDepartments();

        } catch (error) {
            console.error("Create department error:", error);

            if (error.response?.data) {
                const backendError = error.response.data;

                if (typeof backendError === "object") {
                    const messages = Object.entries(backendError)
                        .map(([field, value]) => {
                            if (Array.isArray(value)) {
                                return `${field}: ${value.join(", ")}`;
                            }

                            return `${field}: ${value}`;
                        })
                        .join(" | ");

                    setError(messages);
                } else {
                    setError(String(backendError));
                }
            } else {
                setError(
                    "Unable to create department. Please check your backend server."
                );
            }
        } finally {
            setSaving(false);
        }
    };

    // =========================
    // DELETE DEPARTMENT
    // =========================
    const deleteDepartment = async (id) => {
        const confirmed = window.confirm(
            "Are you sure you want to delete this department?"
        );

        if (!confirmed) {
            return;
        }

        try {
            setError("");
            setSuccess("");

            await departmentService.deleteDepartment(id);

            setSuccess("Department deleted successfully.");

            await loadDepartments();

        } catch (error) {
            console.error("Delete department error:", error);

            if (error.response?.data) {
                const backendError = error.response.data;

                if (typeof backendError === "object") {
                    const messages = Object.entries(backendError)
                        .map(([field, value]) => {
                            if (Array.isArray(value)) {
                                return `${field}: ${value.join(", ")}`;
                            }

                            return `${field}: ${value}`;
                        })
                        .join(" | ");

                    setError(messages);
                } else {
                    setError(String(backendError));
                }
            } else {
                setError(
                    "Unable to delete department. Please check your backend server."
                );
            }
        }
    };

    // =========================
    // EDIT DEPARTMENT
    // =========================
    const editDepartment = (id) => {
        navigate(`/departments/edit/${id}`);
    };

    return (
        <div className="d-flex min-vh-100 bg-light">

            {/* SIDEBAR */}
            <Sidebar />

            {/* MAIN CONTENT */}
            <div className="flex-grow-1">

                {/* HEADER */}
                <div className="bg-white border-bottom px-4 py-3">
                    <div className="d-flex justify-content-between align-items-center">

                        <div>
                            <h4 className="mb-1">
                                Departments
                            </h4>

                            <small className="text-muted">
                                Manage your organization's departments
                            </small>
                        </div>

                        <button
                            type="button"
                            className="btn btn-primary"
                            onClick={() => navigate("/departments/add")}
                        >
                            + Add Department
                        </button>

                    </div>
                </div>

                {/* PAGE CONTENT */}
                <div className="p-4">

                    {/* ERROR */}
                    {error && (
                        <div
                            className="alert alert-danger"
                            role="alert"
                        >
                            <strong>Error:</strong>{" "}
                            {error}
                        </div>
                    )}

                    {/* SUCCESS */}
                    {success && (
                        <div
                            className="alert alert-success"
                            role="alert"
                        >
                            <strong>Success:</strong>{" "}
                            {success}
                        </div>
                    )}

                    {/* ADD DEPARTMENT CARD */}
                    <div className="card border-0 shadow-sm mb-4">

                        <div className="card-header bg-white py-3">
                            <div className="d-flex align-items-center">

                                <div
                                    className="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center me-3"
                                    style={{
                                        width: "45px",
                                        height: "45px",
                                    }}
                                >
                                    🏢
                                </div>

                                <div>
                                    <h5 className="mb-0">
                                        Add Department
                                    </h5>

                                    <small className="text-muted">
                                        Create a new department
                                    </small>
                                </div>

                            </div>
                        </div>

                        <div className="card-body">

                            <form onSubmit={addDepartment}>

                                <div className="row">

                                    {/* NAME */}
                                    <div className="col-md-5 mb-3">

                                        <label
                                            htmlFor="departmentName"
                                            className="form-label fw-semibold"
                                        >
                                            Department Name
                                            <span className="text-danger">
                                                {" "}*
                                            </span>
                                        </label>

                                        <input
                                            type="text"
                                            id="departmentName"
                                            className="form-control"
                                            placeholder="e.g. Information Technology"
                                            value={name}
                                            onChange={(e) =>
                                                setName(e.target.value)
                                            }
                                            required
                                        />

                                    </div>

                                    {/* LOCATION */}
                                    <div className="col-md-5 mb-3">

                                        <label
                                            htmlFor="departmentLocation"
                                            className="form-label fw-semibold"
                                        >
                                            Location
                                        </label>

                                        <input
                                            type="text"
                                            id="departmentLocation"
                                            className="form-control"
                                            placeholder="e.g. Bangalore"
                                            value={location}
                                            onChange={(e) =>
                                                setLocation(e.target.value)
                                            }
                                        />

                                    </div>

                                    {/* BUTTON */}
                                    <div className="col-md-2 mb-3 d-flex align-items-end">

                                        <button
                                            type="submit"
                                            className="btn btn-success w-100"
                                            disabled={saving}
                                        >
                                            {saving ? (
                                                <>
                                                    <span
                                                        className="spinner-border spinner-border-sm me-2"
                                                        role="status"
                                                    ></span>

                                                    Saving...
                                                </>
                                            ) : (
                                                "Add"
                                            )}
                                        </button>

                                    </div>

                                </div>

                            </form>

                        </div>
                    </div>

                    {/* DEPARTMENT LIST */}
                    <div className="card border-0 shadow-sm">

                        <div className="card-header bg-white py-3">

                            <div className="d-flex justify-content-between align-items-center">

                                <div>
                                    <h5 className="mb-0">
                                        Department List
                                    </h5>

                                    <small className="text-muted">
                                        Total Departments:{" "}
                                        {departments.length}
                                    </small>
                                </div>

                            </div>

                        </div>

                        <div className="card-body p-0">

                            {loading ? (

                                <div className="text-center py-5">

                                    <div
                                        className="spinner-border text-primary"
                                        role="status"
                                    ></div>

                                    <p className="mt-3 text-muted">
                                        Loading departments...
                                    </p>

                                </div>

                            ) : departments.length === 0 ? (

                                <div className="text-center py-5">

                                    <div
                                        style={{
                                            fontSize: "50px",
                                        }}
                                    >
                                        🏢
                                    </div>

                                    <h5 className="mt-3">
                                        No Departments Found
                                    </h5>

                                    <p className="text-muted">
                                        Create your first department.
                                    </p>

                                    <button
                                        className="btn btn-primary"
                                        onClick={() =>
                                            navigate(
                                                "/departments/add"
                                            )
                                        }
                                    >
                                        + Add Department
                                    </button>

                                </div>

                            ) : (

                                <div className="table-responsive">

                                    <table className="table table-hover align-middle mb-0">

                                        <thead className="table-light">

                                            <tr>
                                                <th>ID</th>
                                                <th>Department Name</th>
                                                <th>Location</th>
                                                <th className="text-center">
                                                    Actions
                                                </th>
                                            </tr>

                                        </thead>

                                        <tbody>

                                            {departments.map(
                                                (department) => (

                                                    <tr
                                                        key={
                                                            department.id
                                                        }
                                                    >

                                                        <td>
                                                            <span className="badge bg-secondary">
                                                                {
                                                                    department.id
                                                                }
                                                            </span>
                                                        </td>

                                                        <td>
                                                            <strong>
                                                                {
                                                                    department.name
                                                                }
                                                            </strong>
                                                        </td>

                                                        <td>
                                                            {
                                                                department.location ||
                                                                "Not specified"
                                                            }
                                                        </td>

                                                        <td className="text-center">

                                                            <button
                                                                type="button"
                                                                className="btn btn-warning btn-sm me-2"
                                                                onClick={() =>
                                                                    editDepartment(
                                                                        department.id
                                                                    )
                                                                }
                                                            >
                                                                ✏️ Edit
                                                            </button>

                                                            <button
                                                                type="button"
                                                                className="btn btn-danger btn-sm"
                                                                onClick={() =>
                                                                    deleteDepartment(
                                                                        department.id
                                                                    )
                                                                }
                                                            >
                                                                🗑️ Delete
                                                            </button>

                                                        </td>

                                                    </tr>

                                                )
                                            )}

                                        </tbody>

                                    </table>

                                </div>

                            )}

                        </div>

                    </div>

                </div>

            </div>

        </div>
    );
}

export default Departments;