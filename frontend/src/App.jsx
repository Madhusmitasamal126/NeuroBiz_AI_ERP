import { Routes, Route, Navigate } from "react-router-dom";

// =========================
// PUBLIC PAGES
// =========================
import Login from "./pages/Login";
import Registration from "./pages/Registration";

// =========================
// PROTECTED PAGES
// =========================
import Dashboard from "./pages/DashBoard";

import Employees from "./pages/Employees";
import AddEmployee from "./pages/AddEmployee";
import EditEmployee from "./pages/EditEmployee";

import Attendance from "./pages/Attendance";

import Departments from "./pages/Departments";
import DepartmentAdd from "./pages/DepartmentAdd";
import DepartmentEdit from "./pages/DepartmentEdit";

import Sales from "./pages/Sales";
import Inventory from "./pages/Inventory";
import Reports from "./pages/Reports";

import Profile from "./pages/Profile";

// =========================
// AUTHENTICATION
// =========================
import PrivateRoute from "./routes/PrivateRoute";

function App() {
    return (
        <Routes>

            {/* =========================
                PUBLIC ROUTES
            ========================= */}

            <Route
                path="/"
                element={
                    <Navigate
                        to="/login"
                        replace
                    />
                }
            />

            <Route
                path="/login"
                element={<Login />}
            />

            <Route
                path="/register"
                element={<Registration />}
            />


            {/* =========================
                DASHBOARD
            ========================= */}

            <Route
                path="/dashboard"
                element={
                    <PrivateRoute>
                        <Dashboard />
                    </PrivateRoute>
                }
            />


            {/* =========================
                EMPLOYEE MODULE
            ========================= */}

            <Route
                path="/employees"
                element={
                    <PrivateRoute>
                        <Employees />
                    </PrivateRoute>
                }
            />

            <Route
                path="/employees/add"
                element={
                    <PrivateRoute>
                        <AddEmployee />
                    </PrivateRoute>
                }
            />

            <Route
                path="/employees/edit/:id"
                element={
                    <PrivateRoute>
                        <EditEmployee />
                    </PrivateRoute>
                }
            />


            {/* =========================
                ATTENDANCE MODULE
            ========================= */}

            <Route
                path="/attendance"
                element={
                    <PrivateRoute>
                        <Attendance />
                    </PrivateRoute>
                }
            />


            {/* =========================
                DEPARTMENT MODULE
            ========================= */}

            <Route
                path="/departments"
                element={
                    <PrivateRoute>
                        <Departments />
                    </PrivateRoute>
                }
            />

            <Route
                path="/departments/add"
                element={
                    <PrivateRoute>
                        <DepartmentAdd />
                    </PrivateRoute>
                }
            />

            <Route
                path="/departments/edit/:id"
                element={
                    <PrivateRoute>
                        <DepartmentEdit />
                    </PrivateRoute>
                }
            />


            {/* =========================
                SALES / CRM
            ========================= */}

            <Route
                path="/sales"
                element={
                    <PrivateRoute>
                        <Sales />
                    </PrivateRoute>
                }
            />


            {/* =========================
                INVENTORY
            ========================= */}

            <Route
                path="/inventory"
                element={
                    <PrivateRoute>
                        <Inventory />
                    </PrivateRoute>
                }
            />


            {/* =========================
                REPORTS / BI
            ========================= */}

            <Route
                path="/reports"
                element={
                    <PrivateRoute>
                        <Reports />
                    </PrivateRoute>
                }
            />


            {/* =========================
                PROFILE
            ========================= */}

            <Route
                path="/profile"
                element={
                    <PrivateRoute>
                        <Profile />
                    </PrivateRoute>
                }
            />


            {/* =========================
                UNKNOWN URL
            ========================= */}

            <Route
                path="*"
                element={
                    <Navigate
                        to="/login"
                        replace
                    />
                }
            />

        </Routes>
    );
}

export default App;