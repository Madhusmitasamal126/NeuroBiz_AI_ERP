
import { useEffect, useMemo, useState } from "react";
import api from "../services/api";

const reportTemplates = [
  {
    name: "Sales Report",
    category: "Sales",
    description: "Sales invoices and revenue report",
  },
  {
    name: "HR Report",
    category: "HR",
    description: "Employee and HR report",
  },
  {
    name: "Inventory Report",
    category: "Inventory",
    description: "Inventory and stock report",
  },
  {
    name: "Analytics Report",
    category: "Analytics",
    description: "Business analytics report",
  },
];

const styles = {
  page: {
    padding: "24px",
    maxWidth: "1200px",
    margin: "0 auto",
    color: "#1f2937",
    fontFamily: "Arial, sans-serif",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "12px",
    flexWrap: "wrap",
    marginBottom: "24px",
  },
  button: {
    padding: "10px 15px",
    border: "none",
    borderRadius: "7px",
    cursor: "pointer",
    background: "#2563eb",
    color: "white",
    fontWeight: 600,
  },
  secondaryButton: {
    padding: "9px 13px",
    border: "1px solid #d1d5db",
    borderRadius: "7px",
    background: "white",
    cursor: "pointer",
  },
  panel: {
    background: "white",
    border: "1px solid #e5e7eb",
    borderRadius: "10px",
    padding: "18px",
    marginBottom: "20px",
  },
  input: {
    padding: "10px",
    border: "1px solid #d1d5db",
    borderRadius: "7px",
    width: "100%",
    boxSizing: "border-box",
  },
  tableWrapper: {
    overflowX: "auto",
    width: "100%",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    minWidth: "720px",
  },
  cell: {
    textAlign: "left",
    padding: "13px 10px",
    borderBottom: "1px solid #e5e7eb",
    verticalAlign: "middle",
  },
};

function formatDate(value) {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "—";

  return date.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getErrorMessage(error) {
  if (error.response?.status === 401) {
    return "Your session has expired or your access token is missing. Please sign in again.";
  }

  if (error.response?.status === 403) {
    return "You do not have permission to perform this action.";
  }

  if (error.response?.status === 404) {
    return "Reports API was not found. Check your Django URL configuration.";
  }

  const data = error.response?.data;

  if (data && typeof data === "object") {
    return Object.entries(data)
      .map(([key, value]) => {
        const message = Array.isArray(value)
          ? value.join(", ")
          : typeof value === "object"
            ? JSON.stringify(value)
            : String(value);

        return `${key}: ${message}`;
      })
      .join(" | ");
  }

  return error.message || "Something went wrong. Please try again.";
}

export default function Reports() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const [showGenerator, setShowGenerator] = useState(false);
  const [template, setTemplate] = useState("Sales Report");
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");

  // Fetch saved reports from Django/PostgreSQL.
  const fetchReports = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("reports/");
      const data = response.data;

      const results = Array.isArray(data)
        ? data
        : Array.isArray(data?.results)
          ? data.results
          : null;

      if (!results) {
        throw new Error(
          "Unexpected API response. Check your Django pagination settings."
        );
      }

      setReports(results);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  // Create a report record in the database.
  const generateReport = async (event) => {
    event?.preventDefault();

    const selectedTemplate = reportTemplates.find(
      (item) => item.name === template
    );

    if (!selectedTemplate) {
      setError("Please select a valid report template.");
      return;
    }

    try {
      setSaving(true);
      setError("");
      setNotice("");

      const response = await api.post("reports/", {
        name: selectedTemplate.name,
        category: selectedTemplate.category,
        description: selectedTemplate.description,
        status: "Completed",
        format: "CSV",
        records: 0,
      });

      setReports((previous) => [
        response.data,
        ...previous.filter((item) => item.id !== response.data.id),
      ]);

      setShowGenerator(false);
      setNotice("Report record saved successfully to the database.");
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  // Delete the report from the database.
  const deleteReport = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to permanently delete this report?"
    );

    if (!confirmed) return;

    try {
      setDeletingId(id);
      setError("");
      setNotice("");

      await api.delete(`reports/${id}/`);

      setReports((previous) =>
        previous.filter((report) => report.id !== id)
      );

      setNotice("Report deleted successfully.");
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setDeletingId(null);
    }
  };

  // Search and category filtering.
  const filteredReports = useMemo(() => {
    const query = search.trim().toLowerCase();

    return reports.filter((report) => {
      const matchesSearch =
        !query ||
        String(report.name || "").toLowerCase().includes(query) ||
        String(report.description || "").toLowerCase().includes(query) ||
        String(report.category || "").toLowerCase().includes(query);

      const matchesCategory =
        categoryFilter === "All" ||
        report.category === categoryFilter;

      return matchesSearch && matchesCategory;
    });
  }, [reports, search, categoryFilter]);

  // Export the currently filtered report list as a CSV file.
  const exportCSV = () => {
    if (filteredReports.length === 0) {
      setError("There are no reports to export.");
      return;
    }

    const columns = [
      "id",
      "name",
      "category",
      "description",
      "status",
      "format",
      "records",
      "createdAt",
    ];

    const escapeCSV = (value) => {
      const text = String(value ?? "");
      return `"${text.replace(/"/g, '""')}"`;
    };

    const lines = [
      columns.join(","),
      ...filteredReports.map((report) =>
        columns
          .map((column) =>
            escapeCSV(
              column === "createdAt"
                ? report.createdAt || report.created_at
                : report[column]
            )
          )
          .join(",")
      ),
    ];

    const blob = new Blob(["\uFEFF" + lines.join("\r\n")], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = "neurobiz-reports.csv";
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  };

  return (
    <main style={styles.page}>
      <div style={styles.header}>
        <div>
          <h1 style={{ margin: "0 0 8px" }}>Reports</h1>
          <p style={{ margin: 0, color: "#6b7280" }}>
            Create, view, search and manage your saved reports.
          </p>
        </div>

        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
          <button
            type="button"
            style={styles.secondaryButton}
            onClick={fetchReports}
            disabled={loading}
          >
            {loading ? "Loading..." : "Refresh"}
          </button>

          <button
            type="button"
            style={styles.secondaryButton}
            onClick={exportCSV}
          >
            Export CSV
          </button>

          <button
            type="button"
            style={styles.button}
            onClick={() => {
              setError("");
              setNotice("");
              setShowGenerator((previous) => !previous);
            }}
          >
            {showGenerator ? "Close Generator" : "+ Generate Report"}
          </button>
        </div>
      </div>

      {error && (
        <div
          role="alert"
          style={{
            padding: "12px",
            marginBottom: "16px",
            borderRadius: "7px",
            background: "#fef2f2",
            color: "#991b1b",
            overflowWrap: "anywhere",
          }}
        >
          <strong>Problem: </strong>
          {error}
        </div>
      )}

      {notice && (
        <div
          role="status"
          style={{
            padding: "12px",
            marginBottom: "16px",
            borderRadius: "7px",
            background: "#ecfdf5",
            color: "#065f46",
          }}
        >
          {notice}
        </div>
      )}

      {showGenerator && (
        <section style={styles.panel}>
          <h2 style={{ marginTop: 0 }}>Generate a Report</h2>

          <p style={{ color: "#6b7280" }}>
            Choose a report template to save a report record to your database.
          </p>

          <form onSubmit={generateReport}>
            <label
              htmlFor="report-template"
              style={{
                display: "block",
                fontWeight: 600,
                marginBottom: "8px",
              }}
            >
              Report type
            </label>

            <select
              id="report-template"
              value={template}
              onChange={(event) => setTemplate(event.target.value)}
              style={{ ...styles.input, marginBottom: "14px" }}
            >
              {reportTemplates.map((item) => (
                <option key={item.name} value={item.name}>
                  {item.name}
                </option>
              ))}
            </select>

            <div style={{ display: "flex", gap: "10px" }}>
              <button
                type="submit"
                style={{
                  ...styles.button,
                  opacity: saving ? 0.65 : 1,
                }}
                disabled={saving}
              >
                {saving ? "Saving..." : "Save Report"}
              </button>

              <button
                type="button"
                style={styles.secondaryButton}
                onClick={() => setShowGenerator(false)}
                disabled={saving}
              >
                Cancel
              </button>
            </div>
          </form>
        </section>
      )}

      <section
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
          gap: "16px",
          marginBottom: "20px",
        }}
      >
        {[
          { label: "Total Reports", value: reports.length },
          {
            label: "Sales Reports",
            value: reports.filter((r) => r.category === "Sales").length,
          },
          {
            label: "HR Reports",
            value: reports.filter((r) => r.category === "HR").length,
          },
          {
            label: "Inventory Reports",
            value: reports.filter((r) => r.category === "Inventory").length,
          },
        ].map((item) => (
          <div
            key={item.label}
            style={{
              ...styles.panel,
              marginBottom: 0,
            }}
          >
            <p style={{ color: "#6b7280", margin: "0 0 10px" }}>
              {item.label}
            </p>
            <h2 style={{ margin: 0, fontSize: "28px" }}>
              {item.value}
            </h2>
          </div>
        ))}
      </section>

      <section style={styles.panel}>
        <h2 style={{ marginTop: 0 }}>Saved Reports</h2>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: "12px",
            marginBottom: "18px",
          }}
        >
          <input
            type="search"
            placeholder="Search reports..."
            aria-label="Search reports"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            style={styles.input}
          />

          <select
            aria-label="Filter by category"
            value={categoryFilter}
            onChange={(event) => setCategoryFilter(event.target.value)}
            style={styles.input}
          >
            <option value="All">All categories</option>
            <option value="Sales">Sales</option>
            <option value="HR">HR</option>
            <option value="Inventory">Inventory</option>
            <option value="Analytics">Analytics</option>
          </select>
        </div>

        {loading ? (
          <p>Loading reports from the database...</p>
        ) : filteredReports.length === 0 ? (
          <div
            style={{
              padding: "30px 12px",
              textAlign: "center",
              color: "#6b7280",
            }}
          >
            <h3 style={{ color: "#374151" }}>No reports found</h3>
            <p>
              Generate a report to create a database record, or change your
              search filters.
            </p>
          </div>
        ) : (
          <div style={styles.tableWrapper}>
            <table style={styles.table}>
              <thead>
                <tr>
                  {[
                    "Report",
                    "Category",
                    "Status",
                    "Format",
                    "Records",
                    "Created",
                    "Actions",
                  ].map((heading) => (
                    <th
                      key={heading}
                      style={{
                        ...styles.cell,
                        background: "#f9fafb",
                        fontSize: "13px",
                      }}
                    >
                      {heading}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {filteredReports.map((report) => (
                  <tr key={report.id}>
                    <td style={styles.cell}>
                      <strong>{report.name}</strong>
                      <div
                        style={{
                          fontSize: "12px",
                          color: "#6b7280",
                          marginTop: "5px",
                        }}
                      >
                        {report.description || "No description"}
                      </div>
                    </td>

                    <td style={styles.cell}>{report.category}</td>

                    <td style={styles.cell}>
                      <span
                        style={{
                          display: "inline-block",
                          padding: "4px 8px",
                          borderRadius: "12px",
                          fontSize: "12px",
                          background:
                            report.status === "Completed"
                              ? "#dcfce7"
                              : report.status === "Failed"
                                ? "#fee2e2"
                                : "#fef3c7",
                          color:
                            report.status === "Completed"
                              ? "#166534"
                              : report.status === "Failed"
                                ? "#991b1b"
                                : "#92400e",
                        }}
                      >
                        {report.status}
                      </span>
                    </td>

                    <td style={styles.cell}>
                      {report.format || "CSV"}
                    </td>

                    <td style={styles.cell}>
                      {report.records ?? 0}
                    </td>

                    <td style={styles.cell}>
                      {formatDate(
                        report.createdAt || report.created_at
                      )}
                    </td>

                    <td style={styles.cell}>
                      <button
                        type="button"
                        onClick={() => deleteReport(report.id)}
                        disabled={deletingId === report.id}
                        style={{
                          ...styles.secondaryButton,
                          color: "#b91c1c",
                          borderColor: "#fecaca",
                          opacity: deletingId === report.id ? 0.6 : 1,
                        }}
                      >
                        {deletingId === report.id
                          ? "Deleting..."
                          : "Delete"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <p style={{ color: "#6b7280", fontSize: "13px", marginBottom: 0 }}>
          Showing {filteredReports.length} of {reports.length} saved reports.
        </p>
      </section>
    </main>
  );
}
