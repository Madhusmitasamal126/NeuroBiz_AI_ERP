import { useEffect, useState } from "react";

import {
    LineChart,
    Line,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
} from "recharts";

import Sidebar from "../components/Sidebar";

import analyticsService
    from "../services/analyticsService";


function AnalyticsDashboard() {

    const [dashboard, setDashboard] =
        useState(null);

    const [loading, setLoading] =
        useState(true);

    const [error, setError] =
        useState("");


    const loadDashboard = async () => {

        try {

            setLoading(true);
            setError("");


            const data =
                await analyticsService
                    .getDashboard();


            console.log(
                "ANALYTICS DATA:",
                data
            );


            setDashboard(data);


        } catch (error) {

            console.error(
                "ANALYTICS ERROR:",
                error
            );


            if (
                error.response?.status === 401
            ) {

                setError(
                    "Session expired. Please login again."
                );

            } else {

                setError(
                    error.response?.data?.detail ||
                    "Unable to load analytics dashboard."
                );

            }

        } finally {

            setLoading(false);

        }

    };


    useEffect(() => {

        loadDashboard();

    }, []);


    if (loading) {

        return (

            <div className="container mt-5">

                <h3>
                    Loading Analytics Dashboard...
                </h3>

            </div>

        );

    }


    if (error) {

        return (

            <div className="container mt-5">

                <div className="alert alert-danger">

                    {error}

                </div>


                <button
                    className="btn btn-primary"
                    onClick={() => {

                        localStorage.removeItem(
                            "access"
                        );

                        localStorage.removeItem(
                            "refresh"
                        );

                        window.location.href =
                            "/login";

                    }}
                >

                    Login Again

                </button>

            </div>

        );

    }


    if (!dashboard) {

        return null;

    }


    const kpis =
        dashboard.kpis || {};

    const trends =
        dashboard.monthly_trends || [];

    const departments =
        dashboard.departments || [];


    return (

        <div className="d-flex">

            <Sidebar />


            <main
                className="flex-grow-1 p-4"
                style={{
                    background: "#f5f6fa",
                    minHeight: "100vh",
                }}
            >

                <div className="container-fluid">


                    {/* HEADER */}

                    <div className="d-flex justify-content-between align-items-center mb-4">

                        <div>

                            <h2 className="fw-bold">
                                Analytics Dashboard
                            </h2>

                            <p className="text-muted">
                                Business Intelligence & Performance
                            </p>

                        </div>


                        <button
                            className="btn btn-primary"
                            onClick={loadDashboard}
                        >

                            Refresh

                        </button>

                    </div>



                    {/* KPI CARDS */}

                    <div className="row g-4 mb-4">


                        <div className="col-md-4 col-lg-2">

                            <div className="card shadow-sm border-0">

                                <div className="card-body">

                                    <p className="text-muted mb-1">
                                        Revenue
                                    </p>

                                    <h4>
                                        ₹
                                        {Number(
                                            kpis.total_revenue || 0
                                        ).toLocaleString("en-IN")}
                                    </h4>

                                </div>

                            </div>

                        </div>



                        <div className="col-md-4 col-lg-2">

                            <div className="card shadow-sm border-0">

                                <div className="card-body">

                                    <p className="text-muted mb-1">
                                        Expenses
                                    </p>

                                    <h4>
                                        ₹
                                        {Number(
                                            kpis.total_expenses || 0
                                        ).toLocaleString("en-IN")}
                                    </h4>

                                </div>

                            </div>

                        </div>



                        <div className="col-md-4 col-lg-2">

                            <div className="card shadow-sm border-0">

                                <div className="card-body">

                                    <p className="text-muted mb-1">
                                        Profit
                                    </p>

                                    <h4>
                                        ₹
                                        {Number(
                                            kpis.total_profit || 0
                                        ).toLocaleString("en-IN")}
                                    </h4>

                                </div>

                            </div>

                        </div>



                        <div className="col-md-4 col-lg-2">

                            <div className="card shadow-sm border-0">

                                <div className="card-body">

                                    <p className="text-muted mb-1">
                                        Sales
                                    </p>

                                    <h4>
                                        {kpis.total_sales || 0}
                                    </h4>

                                </div>

                            </div>

                        </div>



                        <div className="col-md-4 col-lg-2">

                            <div className="card shadow-sm border-0">

                                <div className="card-body">

                                    <p className="text-muted mb-1">
                                        Attendance
                                    </p>

                                    <h4>
                                        {kpis.average_attendance || 0}%
                                    </h4>

                                </div>

                            </div>

                        </div>



                        <div className="col-md-4 col-lg-2">

                            <div className="card shadow-sm border-0">

                                <div className="card-body">

                                    <p className="text-muted mb-1">
                                        Growth
                                    </p>

                                    <h4>
                                        {dashboard.growth || 0}%
                                    </h4>

                                </div>

                            </div>

                        </div>


                    </div>



                    {/* REVENUE CHART */}

                    <div className="card shadow-sm border-0 mb-4">

                        <div className="card-body">

                            <h5 className="mb-4">
                                Revenue & Expenses
                            </h5>


                            <div
                                style={{
                                    width: "100%",
                                    height: 350,
                                }}
                            >

                                <ResponsiveContainer>

                                    <LineChart
                                        data={trends}
                                    >

                                        <CartesianGrid
                                            strokeDasharray="3 3"
                                        />

                                        <XAxis
                                            dataKey="month"
                                        />

                                        <YAxis />

                                        <Tooltip />

                                        <Legend />


                                        <Line
                                            type="monotone"
                                            dataKey="revenue"
                                            name="Revenue"
                                            strokeWidth={3}
                                        />


                                        <Line
                                            type="monotone"
                                            dataKey="expenses"
                                            name="Expenses"
                                            strokeWidth={3}
                                        />


                                        <Line
                                            type="monotone"
                                            dataKey="profit"
                                            name="Profit"
                                            strokeWidth={3}
                                        />

                                    </LineChart>

                                </ResponsiveContainer>

                            </div>

                        </div>

                    </div>



                    {/* SALES CHART */}

                    <div className="card shadow-sm border-0 mb-4">

                        <div className="card-body">

                            <h5 className="mb-4">
                                Monthly Sales
                            </h5>


                            <div
                                style={{
                                    width: "100%",
                                    height: 350,
                                }}
                            >

                                <ResponsiveContainer>

                                    <BarChart
                                        data={trends}
                                    >

                                        <CartesianGrid
                                            strokeDasharray="3 3"
                                        />

                                        <XAxis
                                            dataKey="month"
                                        />

                                        <YAxis />

                                        <Tooltip />

                                        <Legend />


                                        <Bar
                                            dataKey="sales"
                                            name="Sales"
                                        />

                                    </BarChart>

                                </ResponsiveContainer>

                            </div>

                        </div>

                    </div>



                    {/* DEPARTMENT TABLE */}

                    <div className="card shadow-sm border-0">

                        <div className="card-body">

                            <h5 className="mb-4">
                                Department Performance
                            </h5>


                            <div className="table-responsive">

                                <table className="table table-hover">

                                    <thead>

                                        <tr>

                                            <th>
                                                Department
                                            </th>

                                            <th>
                                                Employees
                                            </th>

                                            <th>
                                                Revenue
                                            </th>

                                            <th>
                                                Target
                                            </th>

                                            <th>
                                                Achievement
                                            </th>

                                            <th>
                                                Attendance
                                            </th>

                                        </tr>

                                    </thead>


                                    <tbody>

                                        {departments.map(
                                            (department, index) => (

                                                <tr
                                                    key={index}
                                                >

                                                    <td>
                                                        {
                                                            department.department
                                                        }
                                                    </td>

                                                    <td>
                                                        {
                                                            department.employees
                                                        }
                                                    </td>

                                                    <td>
                                                        ₹
                                                        {Number(
                                                            department.revenue || 0
                                                        ).toLocaleString(
                                                            "en-IN"
                                                        )}
                                                    </td>

                                                    <td>
                                                        ₹
                                                        {Number(
                                                            department.target || 0
                                                        ).toLocaleString(
                                                            "en-IN"
                                                        )}
                                                    </td>

                                                    <td>
                                                        {
                                                            department.achievement
                                                        }%
                                                    </td>

                                                    <td>
                                                        {
                                                            department.attendance
                                                        }%
                                                    </td>

                                                </tr>

                                            )
                                        )}

                                    </tbody>

                                </table>

                            </div>

                        </div>

                    </div>


                </div>

            </main>

        </div>

    );

}


export default AnalyticsDashboard;