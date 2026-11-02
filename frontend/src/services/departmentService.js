
import api from "./api";

const departmentService = {
  getDepartments: async () => {
    const response = await api.get("/departments/");
    return response.data;
  },

  getDepartment: async (id) => {
    const response = await api.get(`/departments/${id}/`);
    return response.data;
  },

  createDepartment: async (departmentData) => {
    const response = await api.post(
      "/departments/",
      departmentData
    );
    return response.data;
  },

  updateDepartment: async (id, departmentData) => {
    const response = await api.put(
      `/departments/${id}/`,
      departmentData
    );
    return response.data;
  },

  patchDepartment: async (id, departmentData) => {
    const response = await api.patch(
      `/departments/${id}/`,
      departmentData
    );
    return response.data;
  },

  deleteDepartment: async (id) => {
    const response = await api.delete(`/departments/${id}/`);
    return response.data;
  },
};

export default departmentService;