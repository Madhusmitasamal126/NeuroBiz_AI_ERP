import { useState } from "react";
import { useNavigate } from "react-router-dom";

import Sidebar from "../components/Sidebar";

import departmentService from "../services/departmentService";


function DepartmentAdd() {

    const navigate = useNavigate();


    const [formData, setFormData] = useState({

        name: "",

        location: "",

    });


    const [loading, setLoading] = useState(false);

    const [error, setError] = useState("");


    // =================================================
    // INPUT CHANGE
    // =================================================

    const handleChange = (e) => {

        const {
            name,
            value,
        } = e.target;


        setFormData((previous) => ({

            ...previous,

            [name]: value,

        }));


        setError("");

    };


    // =================================================
    // SUBMIT
    // =================================================

    const handleSubmit = async (e) => {

        e.preventDefault();

        setError("");


        if (!formData.name.trim()) {

            setError(
                "Department name is required."
            );

            return;

        }


        setLoading(true);


        try {

            console.log(
                "Submitting department:",
                formData
            );


            const response =
                await departmentService
                    .createDepartment({

                        name:
                            formData.name.trim(),

                        location:
                            formData.location.trim(),

                    });


            console.log(
                "Department created:",
                response
            );


            alert(
                "Department created successfully!"
            );


            navigate(
                "/departments"
            );


        } catch (error) {

            console.error(
                "Department creation error:",
                error
            );


            if (
                error.response?.status === 401
            ) {

                setError(
                    "You are not authenticated. Please logout and login again."
                );

            } else if (
                error.response?.status === 400
            ) {

                const data =
                    error.response.data;


                if (
                    typeof data === "object"
                ) {

                    const message =
                        Object.entries(data)
                            .map(
                                ([field, value]) =>
                                    `${field}: ${
                                        Array.isArray(value)
                                            ? value.join(", ")
                                            : value
                                    }`
                            )
                            .join(" | ");


                    setError(message);

                } else {

                    setError(
                        String(data)
                    );

                }

            } else {

                setError(
                    error.response?.data?.detail ||
                    "Unable to create department."
                );

            }

        } finally {

            setLoading(false);

        }

    };


    return (

        <div className="d-flex min-vh-100 bg-light">


            {/* SIDEBAR */}

            <Sidebar />


            {/* MAIN */}

            <div className="flex-grow-1">


                {/* HEADER */}

                <div className="bg-white border-bottom px-4 py-3">

                    <h4 className="mb-1">

                        Add Department

                    </h4>

                    <small className="text-muted">

                        Create a new department

                    </small>

                </div>


                {/* CONTENT */}

                <div className="p-4">


                    <div className="row justify-content-center">

                        <div className="col-md-8">


                            <div className="card border-0 shadow-sm">


                                <div className="card-body p-4">


                                    {/* ERROR */}

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


                                    {/* FORM */}

                                    <form
                                        onSubmit={
                                            handleSubmit
                                        }
                                    >


                                        {/* NAME */}

                                        <div className="mb-3">

                                            <label
                                                htmlFor="name"
                                                className="form-label fw-semibold"
                                            >

                                                Department Name

                                                <span className="text-danger">
                                                    {" "}*
                                                </span>

                                            </label>


                                            <input
                                                id="name"
                                                name="name"
                                                type="text"
                                                className="form-control"
                                                value={
                                                    formData.name
                                                }
                                                onChange={
                                                    handleChange
                                                }
                                                placeholder="Enter department name"
                                                disabled={loading}
                                                required
                                            />

                                        </div>


                                        {/* LOCATION */}

                                        <div className="mb-4">

                                            <label
                                                htmlFor="location"
                                                className="form-label fw-semibold"
                                            >

                                                Location

                                            </label>


                                            <input
                                                id="location"
                                                name="location"
                                                type="text"
                                                className="form-control"
                                                value={
                                                    formData.location
                                                }
                                                onChange={
                                                    handleChange
                                                }
                                                placeholder="Enter location"
                                                disabled={loading}
                                            />

                                        </div>


                                        {/* BUTTONS */}

                                        <div className="d-flex gap-2">


                                            <button
                                                type="submit"
                                                className="btn btn-primary"
                                                disabled={loading}
                                            >

                                                {loading ? (

                                                    <>

                                                        <span
                                                            className="spinner-border spinner-border-sm me-2"
                                                        />

                                                        Saving...

                                                    </>

                                                ) : (

                                                    "+ Create Department"

                                                )}

                                            </button>


                                            <button
                                                type="button"
                                                className="btn btn-secondary"
                                                disabled={loading}
                                                onClick={() =>
                                                    navigate(
                                                        "/departments"
                                                    )
                                                }
                                            >

                                                Cancel

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


export default DepartmentAdd;