import api from "./api";


// =====================================================
// DEPARTMENT SERVICE
// =====================================================

const departmentService = {


    // =================================================
    // GET ALL DEPARTMENTS
    // GET /api/departments/
    // =================================================

    getDepartments: async () => {

        const response = await api.get(
            "/api/departments/"
        );

        return response.data;

    },


    // =================================================
    // GET ONE DEPARTMENT
    // GET /api/departments/:id/
    // =================================================

    getDepartment: async (id) => {

        const response = await api.get(
            `/api/departments/${id}/`
        );

        return response.data;

    },


    // =================================================
    // CREATE DEPARTMENT
    // POST /api/departments/
    // =================================================

    createDepartment: async (
        departmentData
    ) => {

        console.log(
            "CREATE DEPARTMENT:",
            departmentData
        );


        const response = await api.post(

            "/api/departments/",

            departmentData

        );


        return response.data;

    },


    // =================================================
    // UPDATE DEPARTMENT
    // PUT /api/departments/:id/
    // =================================================

    updateDepartment: async (
        id,
        departmentData
    ) => {

        const response = await api.put(

            `/api/departments/${id}/`,

            departmentData

        );


        return response.data;

    },


    // =================================================
    // PATCH DEPARTMENT
    // PATCH /api/departments/:id/
    // =================================================

    patchDepartment: async (
        id,
        departmentData
    ) => {

        const response = await api.patch(

            `/api/departments/${id}/`,

            departmentData

        );


        return response.data;

    },


    // =================================================
    // DELETE DEPARTMENT
    // DELETE /api/departments/:id/
    // =================================================

    deleteDepartment: async (id) => {

        const response = await api.delete(

            `/api/departments/${id}/`

        );


        return response.data;

    },

};


export default departmentService;