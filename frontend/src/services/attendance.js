
import api from "./api";

// Fetch attendance records from Django.
export const getAttendance = async (params = {}) => {
  const response = await api.get("/attendance/", { params });
  return response.data;
};

// Manually check in the currently logged-in employee.
export const checkIn = async () => {
  const response = await api.post("/attendance/check-in/");
  return response.data;
};

// Manually check out the currently logged-in employee.
export const checkOut = async () => {
  const response = await api.post("/attendance/check-out/");
  return response.data;
};
