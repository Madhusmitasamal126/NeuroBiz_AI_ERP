import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import departmentService from "../services/departmentService";

function DepartmentList() {

    const [departments, setDepartments] = useState([]);

    const loadDepartments = async () => {

        try {

            const data =
                await departmentService.getDepartments();

            setDepartments(
                Array.isArray(data)
                    ? data
                    : data.results || []
            );

        } catch (error) {

            console.error(error);

        }

    };

    useEffect(() => {
        loadDepartments();
    }, []);

    const [name, setName] = useState("");
    const [location, setLocation] = useState("");

    const addDepartment = async (e) => {

        e.preventDefault();

        try {

            await departmentService.createDepartment({
                name,
                location,
            });

            setName("");
            setLocation("");

            loadDepartments();

        } catch (error) {

            console.error(error);

        }

    };

    const deleteDepartment = async (id) => {

        if (!window.confirm("Delete department?")) {
            return;
        }

        await departmentService.deleteDepartment(id);

        loadDepartments();

    };

    return (

        <div className="d-flex">

            <Sidebar />

            <div className="flex-grow-1 p-4">

                <h2>Departments</h2>

                <div className="card mt-4 mb-4">

                    <div className="card-body">

                        <h5>Add Department</h5>

                        <form onSubmit={addDepartment}>

                            <input
                                className="form-control mb-2"
                                placeholder="Department Name"
                                value={name}
                                onChange={(e) =>
                                    setName(e.target.value)
                                }
                                required
                            />

                            <input
                                className="form-control mb-2"
                                placeholder="Location"
                                value={location}
                                onChange={(e) =>
                                    setLocation(e.target.value)
                                }
                            />

                            <button className="btn btn-success">
                                Add Department
                            </button>

                        </form>

                    </div>

                </div>

                <div className="card">

                    <div className="card-body">

                        <table className="table">

                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Name</th>
                                    <th>Location</th>
                                    <th>Action</th>
                                </tr>
                            </thead>

                            <tbody>

                                {departments.map((department) => (

                                    <tr key={department.id}>

                                        <td>
                                            {department.id}
                                        </td>

                                        <td>
                                            {department.name}
                                        </td>

                                        <td>
                                            {department.location}
                                        </td>

                                        <td>
                                            <button
                                                className="btn btn-danger btn-sm"
                                                onClick={() =>
                                                    deleteDepartment(
                                                        department.id
                                                    )
                                                }
                                            >
                                                Delete
                                            </button>
                                        </td>

                                    </tr>

                                ))}

                            </tbody>

                        </table>

                    </div>

                </div>

            </div>

        </div>

    );
}

export default DepartmentList;