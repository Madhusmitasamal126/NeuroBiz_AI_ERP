
import api from "./api";

// Get all employees
export const getEmployees = async () => {
  const response = await api.get("/employees/");
  return response.data;
};

// Get a single employee
export const getEmployee = async (id) => {
  const response = await api.get(`/employees/${id}/`);
  return response.data;
};

// Create an employee
export const createEmployee = async (employeeData) => {
  const response = await api.post("/employees/", employeeData);
  return response.data;
};

// Update an employee
export const updateEmployee = async (id, employeeData) => {
  const response = await api.put(
    `/employees/${id}/`,
    employeeData
  );
  return response.data;
};

// Delete an employee
export const deleteEmployee = async (id) => {
  const response = await api.delete(`/employees/${id}/`);
  return response.data;
};