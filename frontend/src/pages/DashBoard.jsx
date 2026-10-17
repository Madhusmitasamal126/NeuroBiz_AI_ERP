import { useEffect, useState } from "react";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import KPICard from "../components/KPICard";
import Loader from "../components/Loader";

import { getEmployees } from "../services/employee";

const salesData = [
  {
    month: "Jan",
    sales: 12000,
  },
  {
    month: "Feb",
    sales: 18000,
  },
  {
    month: "Mar",
    sales: 15000,
  },
  {
    month: "Apr",
    sales: 22000,
  },
  {
    month: "May",
    sales: 26000,
  },
  {
    month: "Jun",
    sales: 30000,
  },
];

export default function Dashboard() {
  const [
    employees,
    setEmployees,
  ] = useState([]);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    error,
    setError,
  ] = useState("");

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData =
    async () => {
      try {
        setLoading(true);
        setError("");

        const data =
          await getEmployees();

        if (Array.isArray(data)) {
          setEmployees(data);
        } else if (
          Array.isArray(data.results)
        ) {
          setEmployees(
            data.results
          );
        } else {
          setEmployees([]);
        }
      } catch (error) {
        console.error(
          "Dashboard error:",
          error
        );

        setError(
          "Unable to load employee data."
        );
      } finally {
        setLoading(false);
      }
    };

  const totalEmployees =
    employees.length;

  const recentEmployees =
    employees.slice(0, 5);

  return (
    <div className="app-layout">

      {/* Sidebar */}
      <Sidebar />

      {/* Main Area */}
      <div className="main-area">

        {/* Navbar */}
        <Navbar />

        <main className="dashboard-content">

          {/* Header */}
          <div className="mb-4">
            <h2 className="fw-bold">
              Dashboard
            </h2>

            <p className="text-muted">
              Welcome to NeuroBiz AI ERP
            </p>
          </div>

          {/* Loading */}
          {loading && (
            <Loader />
          )}

          {/* Error */}
          {error && (
            <div className="alert alert-danger">
              {error}
            </div>
          )}

          {!loading && (
            <>

              {/* KPI CARDS */}

              <div className="row g-4 mb-4">

                <div className="col-12 col-sm-6 col-xl-3">
                  <KPICard
                    title="Total Employees"
                    value={
                      totalEmployees
                    }
                    subtitle="Current employees"
                    icon="bi-people"
                    color="primary"
                  />
                </div>

                <div className="col-12 col-sm-6 col-xl-3">
                  <KPICard
                    title="Attendance"
                    value="92%"
                    subtitle="Monthly attendance"
                    icon="bi-calendar-check"
                    color="success"
                  />
                </div>

                <div className="col-12 col-sm-6 col-xl-3">
                  <KPICard
                    title="Monthly Sales"
                    value="₹30K"
                    subtitle="Current month"
                    icon="bi-graph-up"
                    color="info"
                  />
                </div>

                <div className="col-12 col-sm-6 col-xl-3">
                  <KPICard
                    title="Stock Alerts"
                    value="8"
                    subtitle="Items need attention"
                    icon="bi-exclamation-triangle"
                    color="warning"
                  />
                </div>

              </div>

              {/* CHART + EMPLOYEES */}

              <div className="row g-4">

                {/* SALES CHART */}

                <div className="col-12 col-xl-8">

                  <div className="card border-0 shadow-sm h-100">

                    <div className="card-body">

                      <div className="d-flex justify-content-between align-items-center mb-4">

                        <div>
                          <h5 className="fw-bold mb-1">
                            Monthly Sales
                          </h5>

                          <small className="text-muted">
                            Sales performance
                          </small>
                        </div>

                      </div>

                      <ResponsiveContainer
                        width="100%"
                        height={350}
                      >
                        <LineChart
                          data={salesData}
                        >
                          <CartesianGrid
                            strokeDasharray="3 3"
                          />

                          <XAxis
                            dataKey="month"
                          />

                          <YAxis />

                          <Tooltip />

                          <Line
                            type="monotone"
                            dataKey="sales"
                            stroke="#0d6efd"
                            strokeWidth={3}
                            dot={{
                              r: 5,
                            }}
                          />

                        </LineChart>
                      </ResponsiveContainer>

                    </div>

                  </div>

                </div>

                {/* RECENT EMPLOYEES */}

                <div className="col-12 col-xl-4">

                  <div className="card border-0 shadow-sm h-100">

                    <div className="card-body">

                      <div className="mb-3">
                        <h5 className="fw-bold mb-1">
                          Recent Employees
                        </h5>

                        <small className="text-muted">
                          Latest employee records
                        </small>
                      </div>

                      {recentEmployees.length ===
                      0 ? (
                        <div className="text-muted text-center py-5">
                          No employees found.
                        </div>
                      ) : (
                        recentEmployees.map(
                          (employee) => {
                            const name =
                              employee.name ||
                              employee.username ||
                              employee.employee_id ||
                              "Employee";

                            return (
                              <div
                                key={
                                  employee.id
                                }
                                className="employee-item"
                              >

                                <div className="employee-avatar">
                                  {name
                                    .charAt(
                                      0
                                    )
                                    .toUpperCase()}
                                </div>

                                <div>
                                  <strong>
                                    {name}
                                  </strong>

                                  <div className="small text-muted">
                                    {employee.designation ||
                                      employee.position ||
                                      "Employee"}
                                  </div>
                                </div>

                              </div>
                            );
                          }
                        )
                      )}

                    </div>

                  </div>

                </div>

              </div>

            </>
          )}

        </main>

      </div>

    </div>
  );
}