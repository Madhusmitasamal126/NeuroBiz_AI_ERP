import api from "./api";


const getDashboard = async () => {

    const response =
        await api.get(
            "/analytics/dashboard/"
        );

    return response.data;

};


const analyticsService = {

    getDashboard,

};


export default analyticsService;