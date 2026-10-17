
import { useCallback, useEffect, useState } from "react";
import {
  getAttendance,
  getAttendanceEmployees,
  checkIn,
  checkOut,
} from "../services/attendanceService";


function localDateString() {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function getRecordEmployeeId(record) {
  const employee = record.employee;
  if (employee && typeof employee === "object") {
    return String(employee.id ?? "");
  }
  return String(employee ?? "");
}

function getStatusClass(status) {
  return `status-${String(status || "Absent")
    .toLowerCase()
    .replace(/\s+/g, "-")}`;
}

function getInitials(name) {
  return String(name || "Employee")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join("");
}

export default function Attendance() {
  const [selectedDate, setSelectedDate] = useState(localDateString);
  const [employees, setEmployees] = useState([]);
  const [records, setRecords] = useState([]);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const loadData = useCallback(async () => {
    setError("");

    try {
      const [employeeData, attendanceData] = await Promise.all([
        getAttendanceEmployees(),
        getAttendance({ date: selectedDate }),
      ]);

      setEmployees(Array.isArray(employeeData) ? employeeData : []);
      const normalizedRecords = Array.isArray(attendanceData)
        ? attendanceData
        : attendanceData?.results || [];

      setRecords(normalizedRecords);
    } catch (err) {
      setError(
        err.response?.data?.detail ||
          "Could not load attendance. Please log in and check the API."
      );
    } finally {
      setLoading(false);
    }
  }, [selectedDate]);

  useEffect(() => {
    setLoading(true);
    loadData();

    const interval = setInterval(loadData, 30000);
    return () => clearInterval(interval);
  }, [loadData]);

  async function handleAttendanceAction(action) {
    setActionLoading(true);
    setError("");
    setNotice("");

    try {
      const response =
        action === "in" ? await checkIn() : await checkOut();

      setNotice(
        response?.detail ||
          (action === "in"
            ? "Check-in recorded successfully."
            : "Check-out recorded successfully.")
      );

      await loadData();
    } catch (err) {
      setError(
        err.response?.data?.detail ||
          "Attendance action failed. Check your login and try again."
      );
    } finally {
      setActionLoading(false);
    }
  }

  const rows = employees.map((employee) => {
    const matchingRecord = records.find(
      (record) =>
        getRecordEmployeeId(record) === String(employee.id)
    );

    const user = employee.user;
    const employeeName =
      employee.user_name ||
      employee.username ||
      (user && typeof user === "object"
        ? user.username ||
          [user.first_name, user.last_name].filter(Boolean).join(" ")
        : "") ||
      employee.employee_id ||
      "Employee";

    return {
      ...employee,
      employeeName,
      department:
        employee.department_name ||
        (employee.department && typeof employee.department === "object"
          ? employee.department.name
          : "") ||
        "—",
      checkIn: matchingRecord?.check_in_display ||
        (matchingRecord?.check_in
          ? new Date(matchingRecord.check_in).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })
          : "—"),
      checkOut: matchingRecord?.check_out_display ||
        (matchingRecord?.check_out
          ? new Date(matchingRecord.check_out).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })
          : "—"),
      status: matchingRecord?.status || "Absent",
    };
  });

  const filteredRows = rows.filter((row) => {
    const query = search.trim().toLowerCase();
    const matchesSearch =
      !query ||
      String(row.employeeName).toLowerCase().includes(query) ||
      String(row.employee_id || "").toLowerCase().includes(query) ||
      String(row.department).toLowerCase().includes(query);

    const matchesStatus =
      filterStatus === "All" || row.status === filterStatus;

    return matchesSearch && matchesStatus;
  });

  const presentCount = rows.filter(
    (row) => row.status === "Present" || row.status === "Late"
  ).length;
  const absentCount = rows.filter(
    (row) => row.status === "Absent"
  ).length;
  const leaveCount = rows.filter(
    (row) => row.status === "On Leave"
  ).length;

  function exportCSV() {
    const headers = [
      "Employee ID",
      "Employee Name",
      "Department",
      "Date",
      "Check In",
      "Check Out",
      "Status",
    ];

    const csvRows = filteredRows.map((row) => [
      row.employee_id || "",
      row.employeeName,
      row.department,
      selectedDate,
      row.checkIn,
      row.checkOut,
      row.status,
    ]);

    const escapeCSV = (value) =>
      `"${String(value ?? "").replace(/"/g, '""')}"`;

    const csv = [headers, ...csvRows]
      .map((row) => row.map(escapeCSV).join(","))
      .join("\r\n");

    const blob = new Blob(["\uFEFF", csv], {
      type: "text/csv;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = `attendance-${selectedDate}.csv`;
    link.click();

    URL.revokeObjectURL(url);
  }

  return (
    <main className="attendance-page">
      <header className="attendance-header">
        <div>
          <h1>Attendance Management</h1>
          <p>Track employee attendance, check-in and check-out.</p>
        </div>

        <div className="attendance-header-actions">
          <button
            className="btn-refresh"
            onClick={loadData}
            disabled={loading}
          >
            Refresh
          </button>
          <button className="btn-export" onClick={exportCSV}>
            Export CSV
          </button>
        </div>
      </header>

      {error && <div className="attendance-error">{error}</div>}
      {notice && <div className="attendance-message">{notice}</div>}

      <section className="my-attendance-panel">
        <div>
          <h2>My Attendance</h2>
          <p>Record attendance using your logged-in employee account.</p>
        </div>

        <div className="my-attendance-actions">
          <button
            className="btn-check-in"
            disabled={actionLoading}
            onClick={() => handleAttendanceAction("in")}
          >
            {actionLoading ? "Please wait..." : "Check In"}
          </button>
          <button
            className="btn-check-out"
            disabled={actionLoading}
            onClick={() => handleAttendanceAction("out")}
          >
            {actionLoading ? "Please wait..." : "Check Out"}
          </button>
        </div>
      </section>

      <section className="attendance-stats">
        <div className="attendance-stat-card">
          <h3>Total Employees</h3>
          <p className="stat-value">{employees.length}</p>
          <span className="stat-description">From employee database</span>
        </div>

        <div className="attendance-stat-card">
          <h3>Present / Late</h3>
          <p className="stat-value">{presentCount}</p>
          <span className="stat-description">Attendance recorded</span>
        </div>

        <div className="attendance-stat-card">
          <h3>Absent</h3>
          <p className="stat-value">{absentCount}</p>
          <span className="stat-description">No attendance record</span>
        </div>

        <div className="attendance-stat-card">
          <h3>On Leave</h3>
          <p className="stat-value">{leaveCount}</p>
          <span className="stat-description">Marked on leave</span>
        </div>
      </section>

      <section className="attendance-card">
        <div className="attendance-card-header">
          <h2>Employee Attendance</h2>
          <span>{filteredRows.length} employees</span>
        </div>

        <div className="attendance-filters">
          <input
            type="search"
            placeholder="Search employee or department..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />

          <input
            type="date"
            value={selectedDate}
            onChange={(event) => setSelectedDate(event.target.value)}
          />

          <select
            value={filterStatus}
            onChange={(event) => setFilterStatus(event.target.value)}
          >
            <option value="All">All statuses</option>
            <option value="Present">Present</option>
            <option value="Late">Late</option>
            <option value="Absent">Absent</option>
            <option value="On Leave">On Leave</option>
            <option value="Half Day">Half Day</option>
          </select>
        </div>

        {loading ? (
          <div className="attendance-message">Loading attendance...</div>
        ) : (
          <div className="attendance-table-wrapper">
            <table className="attendance-table">
              <thead>
                <tr>
                  <th>Employee</th>
                  <th>Department</th>
                  <th>Check In</th>
                  <th>Check Out</th>
                  <th>Status</th>
                </tr>
              </thead>

              <tbody>
                {filteredRows.map((row) => (
                  <tr key={row.id}>
                    <td>
                      <div className="employee-cell">
                        <div className="employee-avatar">
                          {getInitials(row.employeeName)}
                        </div>
                        <div>
                          <span className="employee-name">
                            {row.employeeName}
                          </span>
                          <span className="employee-id">
                            {row.employee_id || `ID ${row.id}`}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td>{row.department}</td>
                    <td>{row.checkIn}</td>
                    <td>{row.checkOut}</td>
                    <td>
                      <span
                        className={`attendance-status ${getStatusClass(
                          row.status
                        )}`}
                      >
                        {row.status}
                      </span>
                    </td>
                  </tr>
                ))}

                {filteredRows.length === 0 && (
                  <tr>
                    <td colSpan="5" className="attendance-message">
                      No employees found. Add an employee or change your
                      search filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  );
}
