
import api from "./api";

// Fetch attendance records, optionally filtered by date.
export const getAttendance = async (params = {}) => {
  const response = await api.get("/attendance/", { params });
  return response.data;
};

// Fetch employees from Django REST Framework.
export const getAttendanceEmployees = async () => {
  const response = await api.get("/employees/");
  const data = response.data;

  return Array.isArray(data) ? data : data?.results || [];
};

// Check in the currently authenticated employee.
export const checkIn = async () => {
  const response = await api.post("/attendance/check-in/");
  return response.data;
};

// Check out the currently authenticated employee.
export const checkOut = async () => {
  const response = await api.post("/attendance/check-out/");
  return response.data;
};

// These exports are intentionally not repeated at the bottom.
