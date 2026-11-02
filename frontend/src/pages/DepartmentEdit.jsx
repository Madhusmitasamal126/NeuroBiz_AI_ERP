
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import Sidebar from "../components/Sidebar";
import departmentService from "../services/departmentService";

function DepartmentEdit() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        name: "",
        location: "",
    });

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    // Load department
    useEffect(() => {
        const loadDepartment = async () => {
            setLoading(true);
            setError("");

            try {
                const data =
                    await departmentService.getDepartment(id);

                setFormData({
                    name: data.name || "",
                    location: data.location || "",
                });

            } catch (error) {
                console.error(
                    "Load department error:",
                    error
                );

                if (error.response?.status === 404) {
                    setError(
                        "Department not found."
                    );
                } else {
                    setError(
                        "Unable to load department."
                    );
                }
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            loadDepartment();
        }
    }, [id]);

    const handleChange = (e) => {
        const { name, value } = e.target;

        setFormData((previous) => ({
            ...previous,
            [name]: value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        setError("");
        setSuccess("");

        if (!formData.name.trim()) {
            setError(
                "Department name is required."
            );
            return;
        }

        setSaving(true);

        try {
            await departmentService.updateDepartment(
                id,
                {
                    name: formData.name.trim(),
                    location: formData.location.trim(),
                }
            );

            setSuccess(
                "Department updated successfully."
            );

            setTimeout(() => {
                navigate("/departments");
            }, 1000);

        } catch (error) {
            console.error(
                "Update department error:",
                error
            );

            if (error.response?.data) {
                const backendError =
                    error.response.data;

                if (
                    typeof backendError ===
                    "object"
                ) {
                    const messages =
                        Object.entries(
                            backendError
                        )
                            .map(
                                ([
                                    field,
                                    value,
                                ]) => {
                                    if (
                                        Array.isArray(
                                            value
                                        )
                                    ) {
                                        return `${field}: ${value.join(
                                            ", "
                                        )}`;
                                    }

                                    return `${field}: ${value}`;
                                }
                            )
                            .join(" | ");

                    setError(messages);
                } else {
                    setError(
                        String(
                            backendError
                        )
                    );
                }
            } else {
                setError(
                    "Unable to update department. Please check your backend server."
                );
            }
        } finally {
            setSaving(false);
        }
    };

    const handleCancel = () => {
        navigate("/departments");
    };

    // Loading Screen
    if (loading) {
        return (
            <div className="d-flex min-vh-100">

                <Sidebar />

                <div className="flex-grow-1 d-flex justify-content-center align-items-center">

                    <div className="text-center">

                        <div
                            className="spinner-border text-primary"
                            role="status"
                        ></div>

                        <p className="mt-3 text-muted">
                            Loading department...
                        </p>

                    </div>

                </div>

            </div>
        );
    }

    return (
        <div className="d-flex min-vh-100 bg-light">

            {/* Sidebar */}
            <Sidebar />

            {/* Main Content */}
            <div className="flex-grow-1">

                {/* Header */}
                <div className="bg-white border-bottom px-4 py-3">

                    <div className="d-flex justify-content-between align-items-center">

                        <div>

                            <h4 className="mb-1">
                                Edit Department
                            </h4>

                            <small className="text-muted">
                                Update department information
                            </small>

                        </div>

                        <button
                            type="button"
                            className="btn btn-outline-secondary"
                            onClick={handleCancel}
                        >
                            ← Back
                        </button>

                    </div>

                </div>

                {/* Page Content */}
                <div className="p-4">

                    <div className="row justify-content-center">

                        <div className="col-xl-8 col-lg-9 col-md-11">

                            {/* Breadcrumb */}
                            <div className="mb-3">

                                <span
                                    className="text-primary"
                                    role="button"
                                    onClick={() =>
                                        navigate(
                                            "/departments"
                                        )
                                    }
                                >
                                    Departments
                                </span>

                                <span className="text-muted mx-2">
                                    /
                                </span>

                                <span className="text-muted">
                                    Edit Department
                                </span>

                            </div>

                            {/* Main Card */}
                            <div className="card border-0 shadow-sm">

                                <div className="card-header bg-white py-3">

                                    <div className="d-flex align-items-center">

                                        <div
                                            className="bg-warning text-dark rounded-circle d-flex align-items-center justify-content-center me-3"
                                            style={{
                                                width: "45px",
                                                height: "45px",
                                            }}
                                        >
                                            ✏️
                                        </div>

                                        <div>

                                            <h5 className="mb-0">
                                                Edit Department
                                            </h5>

                                            <small className="text-muted">
                                                Modify the department
                                                information below.
                                            </small>

                                        </div>

                                    </div>

                                </div>

                                <div className="card-body p-4">

                                    {/* Error */}
                                    {error && (
                                        <div
                                            className="alert alert-danger"
                                            role="alert"
                                        >
                                            <strong>
                                                Error:
                                            </strong>{" "}
                                            {error}
                                        </div>
                                    )}

                                    {/* Success */}
                                    {success && (
                                        <div
                                            className="alert alert-success"
                                            role="alert"
                                        >
                                            <strong>
                                                Success:
                                            </strong>{" "}
                                            {success}
                                        </div>
                                    )}

                                    <form onSubmit={handleSubmit}>

                                        <div className="row">

                                            {/* Department Name */}
                                            <div className="col-md-6 mb-4">

                                                <label
                                                    htmlFor="name"
                                                    className="form-label fw-semibold"
                                                >
                                                    Department Name
                                                    <span className="text-danger">
                                                        *
                                                    </span>
                                                </label>

                                                <input
                                                    type="text"
                                                    id="name"
                                                    name="name"
                                                    className="form-control form-control-lg"
                                                    placeholder="e.g. Information Technology"
                                                    value={
                                                        formData.name
                                                    }
                                                    onChange={
                                                        handleChange
                                                    }
                                                    required
                                                />

                                                <div className="form-text">
                                                    Update the department
                                                    name.
                                                </div>

                                            </div>

                                            {/* Location */}
                                            <div className="col-md-6 mb-4">

                                                <label
                                                    htmlFor="location"
                                                    className="form-label fw-semibold"
                                                >
                                                    Location
                                                </label>

                                                <input
                                                    type="text"
                                                    id="location"
                                                    name="location"
                                                    className="form-control form-control-lg"
                                                    placeholder="e.g. Bangalore"
                                                    value={
                                                        formData.location
                                                    }
                                                    onChange={
                                                        handleChange
                                                    }
                                                />

                                                <div className="form-text">
                                                    Update the department
                                                    location.
                                                </div>

                                            </div>

                                        </div>

                                        {/* Current Information */}
                                        <div className="border rounded p-3 bg-light mb-4">

                                            <h6 className="fw-semibold mb-3">
                                                Updated Information
                                            </h6>

                                            <div className="row">

                                                <div className="col-md-6">

                                                    <small className="text-muted">
                                                        Department
                                                    </small>

                                                    <p className="mb-2 fw-semibold">
                                                        {formData.name ||
                                                            "Not entered"}
                                                    </p>

                                                </div>

                                                <div className="col-md-6">

                                                    <small className="text-muted">
                                                        Location
                                                    </small>

                                                    <p className="mb-2 fw-semibold">
                                                        {formData.location ||
                                                            "Not entered"}
                                                    </p>

                                                </div>

                                            </div>

                                        </div>

                                        {/* Buttons */}
                                        <div className="d-flex justify-content-end gap-2">

                                            <button
                                                type="button"
                                                className="btn btn-outline-secondary px-4"
                                                onClick={
                                                    handleCancel
                                                }
                                                disabled={
                                                    saving
                                                }
                                            >
                                                Cancel
                                            </button>

                                            <button
                                                type="submit"
                                                className="btn btn-warning px-4"
                                                disabled={
                                                    saving
                                                }
                                            >
                                                {saving ? (
                                                    <>
                                                        <span
                                                            className="spinner-border spinner-border-sm me-2"
                                                            role="status"
                                                        ></span>

                                                        Updating...
                                                    </>
                                                ) : (
                                                    <>
                                                        💾 Update Department
                                                    </>
                                                )}
                                            </button>

                                        </div>

                                    </form>

                                </div>

                            </div>

                        </div>

                    </div>

                </div>

            </div>

        </div>
    );
}

export default DepartmentEdit;


