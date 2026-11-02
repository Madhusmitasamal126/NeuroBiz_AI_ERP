
import { useState } from "react";
import {
  ResponsiveContainer,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  BarChart,
  Bar,
  LineChart,
  Line,
} from "recharts";

import {
  analyzeExcel,
  downloadExcelReport,
} from "../services/excelApi";

const panel = {
  background: "#fff",
  border: "1px solid #e5e7eb",
  borderRadius: 12,
  padding: 20,
};

const formatMoney = (value) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(Number(value) || 0);

function MetricCard({ title, value }) {
  return (
    <div style={panel}>
      <p style={{ color: "#6b7280", margin: 0 }}>{title}</p>
      <h2 style={{ marginBottom: 0, overflowWrap: "anywhere" }}>
        {value}
      </h2>
    </div>
  );
}

export default function ExcelAnalytics() {
  const [file, setFile] = useState(null);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [downloading, setDownloading] = useState(false);

  function selectFile(event) {
    const selected = event.target.files?.[0] || null;

    setError("");
    setResult(null);
    setFile(null);

    if (!selected) return;

    const extension = selected.name
      .split(".")
      .pop()
      .toLowerCase();

    if (!["csv", "xlsx", "xls"].includes(extension)) {
      setError("Please select a CSV, XLSX, or XLS file.");
      event.target.value = "";
      return;
    }

    if (selected.size > 10 * 1024 * 1024) {
      setError("The file must be 10 MB or smaller.");
      event.target.value = "";
      return;
    }

    setFile(selected);
  }

  async function handleAnalyze() {
    if (!file) {
      setError("Please choose a file first.");
      return;
    }

    setLoading(true);
    setError("");
    setResult(null);

    try {
      const data = await analyzeExcel(file);
      setResult(data);
    } catch (err) {
      setError(err.message || "Unable to analyze the file.");
    } finally {
      setLoading(false);
    }
  }

  async function handleDownload() {
    if (!file) return;

    setDownloading(true);
    setError("");

    try {
      await downloadExcelReport(file);
    } catch (err) {
      setError(err.message || "Unable to download the report.");
    } finally {
      setDownloading(false);
    }
  }

  const kpis = result?.kpis;

  return (
    <main
      style={{
        padding: 24,
        minHeight: "100vh",
        background: "#f5f7fb",
        color: "#1f2937",
      }}
    >
      <header style={{ marginBottom: 24 }}>
        <h1>Excel Business Analytics</h1>
        <p>
          Upload sales data, review business KPIs, and export a
          cleaned Excel report.
        </p>
      </header>

      <section style={panel}>
        <h2>Upload Sales File</h2>

        <p>
          Accepted formats: CSV, XLSX, XLS. Maximum file size: 10 MB.
        </p>

        <input
          type="file"
          accept=".csv,.xlsx,.xls"
          onChange={selectFile}
          aria-label="Choose sales file"
        />

        {file && (
          <p>
            Selected file: <strong>{file.name}</strong>
          </p>
        )}

        <div
          style={{
            display: "flex",
            gap: 12,
            flexWrap: "wrap",
            marginTop: 16,
          }}
        >
          <button
            type="button"
            onClick={handleAnalyze}
            disabled={!file || loading}
          >
            {loading ? "Analyzing..." : "Analyze File"}
          </button>

          <button
            type="button"
            onClick={handleDownload}
            disabled={!file || downloading}
          >
            {downloading ? "Preparing..." : "Download Excel Report"}
          </button>
        </div>

        {error && (
          <p
            role="alert"
            style={{
              marginTop: 16,
              padding: 12,
              borderRadius: 8,
              background: "#fee2e2",
              color: "#991b1b",
            }}
          >
            {error}
          </p>
        )}
      </section>

      {result && kpis && (
        <>
          <section
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
              gap: 16,
              marginTop: 24,
            }}
          >
            <MetricCard
              title="Total Revenue"
              value={formatMoney(kpis.total_revenue)}
            />

            <MetricCard
              title="Orders"
              value={kpis.order_count}
            />

            <MetricCard
              title="Average Order Value"
              value={formatMoney(kpis.average_order_value)}
            />

            <MetricCard
              title="Rows Analyzed"
              value={kpis.rows_analyzed}
            />

            <MetricCard
              title="Duplicates Removed"
              value={kpis.duplicates_removed}
            />

            <MetricCard
              title="Unique Products"
              value={kpis.unique_products ?? "Not available"}
            />
          </section>

          <section
            style={{
              ...panel,
              marginTop: 24,
              height: 360,
            }}
          >
            <h2>Monthly Revenue</h2>

            {result.monthly_trends?.length ? (
              <ResponsiveContainer width="100%" height="85%">
                <LineChart data={result.monthly_trends}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip
                    formatter={(value) => formatMoney(value)}
                  />
                  <Line
                    dataKey="revenue"
                    name="Revenue"
                    type="monotone"
                    stroke="#2563eb"
                    strokeWidth={3}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <p>
                No monthly trend available. Include an order date column
                to generate this chart.
              </p>
            )}
          </section>

          <section
            style={{
              ...panel,
              marginTop: 24,
              height: 360,
            }}
          >
            <h2>Top 10 Products by Revenue</h2>

            {result.top_products?.length ? (
              <ResponsiveContainer width="100%" height="85%">
                <BarChart
                  data={result.top_products}
                  margin={{ bottom: 35, left: 10, right: 10 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="product"
                    angle={-25}
                    textAnchor="end"
                    interval={0}
                    height={75}
                  />
                  <YAxis />
                  <Tooltip
                    formatter={(value) => formatMoney(value)}
                  />
                  <Bar
                    dataKey="revenue"
                    name="Revenue"
                    fill="#0d9488"
                  />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p>
                No product summary available. Include a product column
                to generate this chart.
              </p>
            )}
          </section>

          <section style={{ ...panel, marginTop: 24 }}>
            <h2>Cleaned Data Preview</h2>
            <p>
              Showing up to 20 records. Download the Excel report
              for the complete cleaned dataset.
            </p>

            {result.cleaned_preview?.length ? (
              <div style={{ overflowX: "auto" }}>
                <table
                  style={{
                    borderCollapse: "collapse",
                    width: "100%",
                    fontSize: 13,
                  }}
                >
                  <thead>
                    <tr>
                      {Object.keys(result.cleaned_preview[0]).map(
                        (column) => (
                          <th
                            key={column}
                            style={{
                              padding: 10,
                              textAlign: "left",
                              borderBottom: "2px solid #e5e7eb",
                            }}
                          >
                            {column}
                          </th>
                        )
                      )}
                    </tr>
                  </thead>

                  <tbody>
                    {result.cleaned_preview.map((row, index) => (
                      <tr key={index}>
                        {Object.keys(result.cleaned_preview[0]).map(
                          (column) => (
                            <td
                              key={column}
                              style={{
                                padding: 10,
                                borderBottom: "1px solid #e5e7eb",
                              }}
                            >
                              {row[column] == null
                                ? "—"
                                : String(row[column])}
                            </td>
                          )
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p>No cleaned records to preview.</p>
            )}
          </section>
        </>
      )}
    </main>
  );
}
