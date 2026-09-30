import api from "./api";

// Get all employees
export const getEmployees = async () => {
  const response = await api.get("/api/employees/");
  return response.data;
};

// Get single employee
export const getEmployee = async (id) => {
  const response = await api.get(`/api/employees/${id}/`);
  return response.data;
};

// Create employee
export const createEmployee = async (employeeData) => {
  const response = await api.post(
    "/api/employees/",
    employeeData
  );

  return response.data;
};

// Update employee
export const updateEmployee = async (id, employeeData) => {
  const response = await api.put(
    `/api/employees/${id}/`,
    employeeData
  );

  return response.data;
};

// Delete employee
export const deleteEmployee = async (id) => {
  const response = await api.delete(
    `/api/employees/${id}/`
  );

  return response.data;
};