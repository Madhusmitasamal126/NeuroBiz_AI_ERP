
import { useCallback, useEffect, useState } from "react";

import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from "recharts";

import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import analyticsService from "../services/analyticsService";

const currency = (value) =>
  `₹${Number(value || 0).toLocaleString("en-IN", {
    maximumFractionDigits: 2,
  })}`;

function MetricCard({ title, value, subtitle }) {
  return (
    <div className="col-12 col-sm-6 col-xl-4">
      <div className="card border-0 shadow-sm h-100">
        <div className="card-body">
          <p className="text-muted mb-2">{title}</p>
          <h3 className="fw-bold mb-2">{value}</h3>
          <small className="text-muted">{subtitle}</small>
        </div>
      </div>
    </div>
  );
}

export default function Analytics() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [attempt, setAttempt] = useState(0);

  const loadAnalytics = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const result = await analyticsService.getDashboard();

      if (!result || typeof result !== "object") {
        throw new Error("The analytics API returned invalid data.");
      }

      setData(result);
    } catch (err) {
      console.error("Analytics dashboard failed:", err);

      const status = err.response?.status;
      const serverMessage =
        err.response?.data?.detail ||
        err.response?.data?.error ||
        err.response?.data?.details;

      if (!err.response) {
        setError(
          "Cannot connect to Django. Start the backend and check the API URL."
        );
      } else if (status === 401) {
        setError(
          "Authentication failed. Log in again and retry the analytics request."
        );
      } else if (status === 403) {
        setError(
          "You do not have permission to access analytics."
        );
      } else if (status === 404) {
        setError(
          "Analytics endpoint returned 404. Check the Django root urls.py and confirm the request URL in the browser Network tab."
        );
      } else if (status >= 500) {
        setError(
          serverMessage ||
            "Django encountered a server error while calculating analytics."
        );
      } else {
        setError(
          serverMessage ||
            `Unable to load analytics data (HTTP ${status}).`
        );
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAnalytics();
  }, [loadAnalytics, attempt]);

  const kpis = data?.kpis || {};
  const trends = Array.isArray(data?.monthly_trends)
    ? data.monthly_trends
    : [];
  const departments = Array.isArray(data?.department_analysis)
    ? data.department_analysis
    : [];

  const growthValue =
    typeof data?.revenue_growth === "number"
      ? data.revenue_growth
      : Number(data?.revenue_growth?.growth || 0);

  return (
    <div className="d-flex" style={{ minHeight: "100vh" }}>
      <Sidebar />

      <div className="flex-grow-1" style={{ minWidth: 0 }}>
        <Navbar />

        <main className="container-fluid p-3 p-md-4">
          <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4">
            <div>
              <h2 className="fw-bold mb-1">Business Analytics</h2>
              <p className="text-muted mb-0">
                NeuroBiz AI ERP — Enterprise Dashboard
              </p>
            </div>

            <button
              type="button"
              className="btn btn-primary"
              onClick={() => setAttempt((value) => value + 1)}
              disabled={loading}
            >
              {loading ? "Loading..." : "Refresh Data"}
            </button>
          </div>

          {loading && (
            <div className="alert alert-info" role="status">
              Loading analytics from Django...
            </div>
          )}

          {!loading && error && (
            <div className="alert alert-danger" role="alert">
              <h5 className="fw-bold">Analytics Error</h5>
              <p className="mb-3">{error}</p>
              <button
                type="button"
                className="btn btn-outline-danger"
                onClick={() => setAttempt((value) => value + 1)}
              >
                Try Again
              </button>
            </div>
          )}

          {!loading && !error && data && (
            <>
              <div className="row g-3 mb-4">
                <MetricCard
                  title="Total Revenue"
                  value={currency(kpis.total_revenue)}
                  subtitle="Revenue across recorded months"
                />

                <MetricCard
                  title="Total Expenses"
                  value={currency(kpis.total_expenses)}
                  subtitle="Recorded business expenses"
                />

                <MetricCard
                  title="Total Profit"
                  value={currency(kpis.total_profit)}
                  subtitle="Revenue minus expenses"
                />

                <MetricCard
                  title="Total Sales"
                  value={Number(kpis.total_sales || 0).toLocaleString("en-IN")}
                  subtitle="Recorded sales count"
                />

                <MetricCard
                  title="Average Attendance"
                  value={`${Number(
                    kpis.average_attendance || 0
                  ).toLocaleString("en-IN")}%`}
                  subtitle="Average recorded attendance"
                />

                <MetricCard
                  title="Stock Value"
                  value={currency(kpis.stock_value)}
                  subtitle="Latest recorded stock value"
                />
              </div>

              <div className="row g-3 mb-4">
                <div className="col-12">
                  <div className="card border-0 shadow-sm">
                    <div className="card-body">
                      <div className="d-flex flex-wrap justify-content-between gap-2 mb-3">
                        <h5 className="fw-bold mb-0">
                          Revenue, Expenses & Profit
                        </h5>
                        <span className="text-muted">
                          Revenue growth: {growthValue}%
                        </span>
                      </div>

                      {trends.length === 0 ? (
                        <p className="text-muted py-5 text-center">
                          No monthly analytics records found. Add business
                          metrics in Django to populate this chart.
                        </p>
                      ) : (
                        <div style={{ width: "100%", height: 320 }}>
                          <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={trends}>
                              <CartesianGrid strokeDasharray="3 3" />
                              <XAxis dataKey="month" />
                              <YAxis />
                              <Tooltip formatter={(value) => currency(value)} />
                              <Legend />
                              <Line
                                type="monotone"
                                dataKey="revenue"
                                name="Revenue"
                                stroke="#2563eb"
                                strokeWidth={3}
                              />
                              <Line
                                type="monotone"
                                dataKey="expenses"
                                name="Expenses"
                                stroke="#dc2626"
                                strokeWidth={2}
                              />
                              <Line
                                type="monotone"
                                dataKey="profit"
                                name="Profit"
                                stroke="#16a34a"
                                strokeWidth={2}
                              />
                            </LineChart>
                          </ResponsiveContainer>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="col-12">
                  <div className="card border-0 shadow-sm">
                    <div className="card-body">
                      <h5 className="fw-bold mb-3">Monthly Sales</h5>

                      {trends.length === 0 ? (
                        <p className="text-muted">
                          No sales trend data available.
                        </p>
                      ) : (
                        <div style={{ width: "100%", height: 300 }}>
                          <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={trends}>
                              <CartesianGrid strokeDasharray="3 3" />
                              <XAxis dataKey="month" />
                              <YAxis />
                              <Tooltip />
                              <Bar
                                dataKey="sales"
                                name="Sales"
                                fill="#6366f1"
                                radius={[4, 4, 0, 0]}
                              />
                            </BarChart>
                          </ResponsiveContainer>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="col-12">
                  <div className="card border-0 shadow-sm">
                    <div className="card-body">
                      <h5 className="fw-bold mb-3">
                        Department Performance
                      </h5>

                      {departments.length === 0 ? (
                        <p className="text-muted">
                          No department metrics available yet.
                        </p>
                      ) : (
                        <div className="table-responsive">
                          <table className="table table-hover align-middle">
                            <thead>
                              <tr>
                                <th>Department</th>
                                <th>Employees</th>
                                <th>Revenue</th>
                                <th>Target</th>
                                <th>Achievement</th>
                                <th>Attendance</th>
                              </tr>
                            </thead>
                            <tbody>
                              {departments.map((department, index) => (
                                <tr
                                  key={`${department.department}-${index}`}
                                >
                                  <td>{department.department}</td>
                                  <td>{department.employees}</td>
                                  <td>{currency(department.revenue)}</td>
                                  <td>{currency(department.target)}</td>
                                  <td>
                                    {Number(
                                      department.achievement || 0
                                    ).toLocaleString("en-IN")}
                                    %
                                  </td>
                                  <td>
                                    {Number(
                                      department.attendance || 0
                                    ).toLocaleString("en-IN")}
                                    %
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
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