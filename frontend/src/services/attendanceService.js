
import api from "./api";

// Fetch attendance records from Django.
// Pass { date: "YYYY-MM-DD" } to filter by date.
export const getAttendance = async (params = {}) => {
  const response = await api.get("/attendance/", { params });
  return response.data;
};

// Fetch employees directly from the employee database.
export const getAttendanceEmployees = async () => {
  const response = await api.get("/employees/");
  const data = response.data;

  return Array.isArray(data) ? data : data.results || [];
};

// Check in the currently authenticated employee.
// The backend must identify the employee from request.user.
export const checkIn = async () => {
  const response = await api.post("/attendance/check-in/");
  return response.data;
};

// Check out the currently authenticated employee.
export const checkOut = async () => {
  const response = await api.post("/attendance/check-out/");
  return response.data;
};
