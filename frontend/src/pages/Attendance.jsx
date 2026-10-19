
import { useCallback, useEffect, useState } from "react";
import {
  getAttendance,
  getAttendanceEmployees,
  checkIn,
  checkOut,
} from "../services/attendanceService";


function localDateString() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function getRecordEmployeeId(record) {
  const employee = record?.employee;
  return String(
    employee && typeof employee === "object"
      ? employee.id ?? ""
      : employee ?? ""
  );
}

function getStatusClass(status) {
  return `status-${String(status || "Absent")
    .toLowerCase()
    .replace(/\s+/g, "-")}`;
}

function getInitials(name) {
  return String(name || "Employee")
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join("");
}

function durationMinutes(start, end = new Date()) {
  if (!start) return 0;

  const startMs = new Date(start).getTime();
  const endMs = new Date(end).getTime();

  if (!Number.isFinite(startMs) || !Number.isFinite(endMs)) return 0;

  return Math.max(0, Math.floor((endMs - startMs) / 60000));
}

function formatDuration(minutes) {
  const safeMinutes = Math.max(0, Math.floor(Number(minutes) || 0));
  const hours = Math.floor(safeMinutes / 60);
  const mins = safeMinutes % 60;
  return `${hours}h ${String(mins).padStart(2, "0")}m`;
}

function formatTime(value) {
  if (!value) return "—";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);

  return date.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}

// Browser-side break persistence.
// For permanent, multi-device records, save breaks through Django APIs.
function readBreakSession(date) {
  try {
    const raw = localStorage.getItem(`attendance-breaks-${date}`);
    if (!raw) return { activeBreak: null, breaks: [] };

    const parsed = JSON.parse(raw);
    return {
      activeBreak: parsed.activeBreak || null,
      breaks: Array.isArray(parsed.breaks) ? parsed.breaks : [],
    };
  } catch {
    return { activeBreak: null, breaks: [] };
  }
}

function saveBreakSession(date, session) {
  localStorage.setItem(
    `attendance-breaks-${date}`,
    JSON.stringify(session)
  );
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

  const [now, setNow] = useState(() => Date.now());
  const [breakSession, setBreakSession] = useState(() =>
    readBreakSession(localDateString())
  );

  // Keep the work and break timers moving without reloading the API.
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Load the saved break session when the selected date changes.
  useEffect(() => {
    setBreakSession(readBreakSession(selectedDate));
  }, [selectedDate]);

  const updateBreakSession = useCallback(
    (nextSession) => {
      setBreakSession(nextSession);

      try {
        saveBreakSession(selectedDate, nextSession);
      } catch {
        setError("Could not save break data in this browser.");
      }
    },
    [selectedDate]
  );

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
          err.response?.data?.message ||
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
    if (action === "out" && breakSession.activeBreak) {
      setError("Please end your active break before checking out.");
      return;
    }

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
          err.response?.data?.message ||
          "Attendance action failed. Check your login and try again."
      );
    } finally {
      setActionLoading(false);
    }
  }

  function handleBreakStart() {
    if (breakSession.activeBreak) {
      setError("A break is already in progress.");
      return;
    }

    setError("");
    setNotice("");

    const nextSession = {
      ...breakSession,
      activeBreak: new Date().toISOString(),
    };

    updateBreakSession(nextSession);
    setNotice("Break started. Remember to end your break when you return.");
  }

  function handleBreakEnd() {
    if (!breakSession.activeBreak) {
      setError("Please start your break first.");
      return;
    }

    const endedAt = new Date().toISOString();
    const minutes = durationMinutes(breakSession.activeBreak, endedAt);

    const nextSession = {
      activeBreak: null,
      breaks: [
        ...breakSession.breaks,
        {
          started_at: breakSession.activeBreak,
          ended_at: endedAt,
          minutes,
        },
      ],
    };

    updateBreakSession(nextSession);
    setError("");
    setNotice(`Break completed: ${formatDuration(minutes)}.`);
  }

  const totalBreakMinutes = breakSession.breaks.reduce(
    (sum, item) => sum + Number(item.minutes || 0),
    0
  );

  const activeBreakMinutes = breakSession.activeBreak
    ? durationMinutes(breakSession.activeBreak, new Date(now))
    : 0;

  const displayedBreakMinutes =
    totalBreakMinutes + activeBreakMinutes;

  const rows = employees.map((employee) => {
    const matchingRecord = records.find(
      (record) => getRecordEmployeeId(record) === String(employee.id)
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

    const checkInValue = matchingRecord?.check_in;
    const checkOutValue = matchingRecord?.check_out;

    const grossMinutes = checkInValue
      ? durationMinutes(
          checkInValue,
          checkOutValue || new Date(now)
        )
      : 0;

    // This value must be supplied by the backend for each employee.
    const employeeBreakMinutes = Math.max(
      0,
      Number(matchingRecord?.total_break_minutes || 0)
    );

    const netMinutes = Math.max(
      0,
      grossMinutes - employeeBreakMinutes
    );

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
        formatTime(checkInValue),
      checkOut: matchingRecord?.check_out_display ||
        formatTime(checkOutValue),
      workingHours: checkInValue ? formatDuration(netMinutes) : "—",
      elapsedHours: checkInValue ? formatDuration(grossMinutes) : "—",
      breakDuration: matchingRecord
        ? formatDuration(employeeBreakMinutes)
        : "—",
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

  // This is a browser timer for the break panel. Employee work totals
  // are calculated from attendance timestamps returned by the API.
  const myRecord = records.find((record) => record.check_in);
  const myGrossMinutes = myRecord?.check_in
    ? durationMinutes(
        myRecord.check_in,
        myRecord.check_out || new Date(now)
      )
    : 0;

  const myNetMinutes = Math.max(
    0,
    myGrossMinutes - displayedBreakMinutes
  );

  function exportCSV() {
    const headers = [
      "Employee ID",
      "Employee Name",
      "Department",
      "Date",
      "Check In",
      "Check Out",
      "Elapsed Time",
      "Break Time",
      "Net Working Hours",
      "Status",
    ];

    const csvRows = filteredRows.map((row) => [
      row.employee_id || "",
      row.employeeName,
      row.department,
      selectedDate,
      row.checkIn,
      row.checkOut,
      row.elapsedHours,
      row.breakDuration,
      row.workingHours,
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
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  }

  return (
    <main className="attendance-page">
      <header className="attendance-header">
        <div>
          <h1>Attendance Management</h1>
          <p>Track check-in, check-out, breaks and net working hours.</p>
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
            disabled={actionLoading || !!breakSession.activeBreak}
            onClick={() => handleAttendanceAction("out")}
          >
            {actionLoading ? "Please wait..." : "Check Out"}
          </button>
        </div>
      </section>

      <section className="work-summary-grid">
        <article className="work-summary-card">
          <span>Elapsed Time</span>
          <strong>{formatDuration(myGrossMinutes)}</strong>
          <small>Check-in to now / check-out</small>
        </article>

        <article className="work-summary-card">
          <span>Break Time</span>
          <strong>{formatDuration(displayedBreakMinutes)}</strong>
          <small>
            {breakSession.activeBreak ? "Break in progress" : "Total recorded breaks"}
          </small>
        </article>

        <article className="work-summary-card">
          <span>Net Working Time</span>
          <strong>{formatDuration(myNetMinutes)}</strong>
          <small>Elapsed time minus tracked breaks</small>
        </article>
      </section>

      <section className="attendance-card break-card">
        <div className="attendance-card-header">
          <div>
            <h2>Break Management</h2>
            <p>
              {breakSession.activeBreak
                ? `Break started at ${formatTime(breakSession.activeBreak)}`
                : "Start and end each break during your workday."}
            </p>
          </div>

          <span
            className={`break-indicator ${
              breakSession.activeBreak ? "break-indicator-active" : ""
            }`}
          >
            {breakSession.activeBreak ? "On Break" : "Working"}
          </span>
        </div>

        <div className="break-actions">
          <button
            className="btn-break-start"
            onClick={handleBreakStart}
            disabled={!!breakSession.activeBreak || actionLoading}
          >
            Start Break
          </button>

          <button
            className="btn-break-end"
            onClick={handleBreakEnd}
            disabled={!breakSession.activeBreak || actionLoading}
          >
            End Break
          </button>
        </div>

        {breakSession.breaks.length > 0 && (
          <div className="break-history">
            <h3>Today's Break History</h3>
            <div className="attendance-table-wrapper">
              <table className="attendance-table">
                <thead>
                  <tr>
                    <th>Break #</th>
                    <th>Start</th>
                    <th>End</th>
                    <th>Duration</th>
                  </tr>
                </thead>
                <tbody>
                  {breakSession.breaks.map((item, index) => (
                    <tr key={`${item.started_at}-${index}`}>
                      <td>{index + 1}</td>
                      <td>{formatTime(item.started_at)}</td>
                      <td>{formatTime(item.ended_at)}</td>
                      <td>{formatDuration(item.minutes)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </section>

      <section className="attendance-stats">
        <article className="attendance-stat-card">
          <h3>Total Employees</h3>
          <p className="stat-value">{employees.length}</p>
          <span className="stat-description">From employee database</span>
        </article>

        <article className="attendance-stat-card">
          <h3>Present / Late</h3>
          <p className="stat-value">{presentCount}</p>
          <span className="stat-description">Attendance recorded</span>
        </article>

        <article className="attendance-stat-card">
          <h3>Absent</h3>
          <p className="stat-value">{absentCount}</p>
          <span className="stat-description">No attendance record</span>
        </article>

        <article className="attendance-stat-card">
          <h3>On Leave</h3>
          <p className="stat-value">{leaveCount}</p>
          <span className="stat-description">Marked on leave</span>
        </article>
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
                  <th>Elapsed Time</th>
                  <th>Break Time</th>
                  <th>Net Working Hours</th>
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
                    <td>{row.elapsedHours}</td>
                    <td>{row.breakDuration}</td>
                    <td>{row.workingHours}</td>

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
                    <td colSpan={8} className="attendance-message">
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
