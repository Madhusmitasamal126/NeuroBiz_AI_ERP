
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
import Profile from "./pages/Profile";

// =========================
// AUTHENTICATION
// =========================
import PrivateRoute from "./routes/PrivateRoute";

function App() {
  return (
    <Routes>

      {/* =====================================
          PUBLIC ROUTES
      ===================================== */}

      {/* Root → Login */}
      <Route
        path="/"
        element={<Navigate to="/login" replace />}
      />

      {/* Login */}
      <Route
        path="/login"
        element={<Login />}
      />

      {/* Registration */}
      <Route
        path="/register"
        element={<Registration />}
      />


      {/* =====================================
          PROTECTED ROUTES
      ===================================== */}

      {/* Dashboard */}
      <Route
        path="/dashboard"
        element={
          <PrivateRoute>
            <Dashboard />
          </PrivateRoute>
        }
      />

      {/* =====================================
          EMPLOYEE MODULE
      ===================================== */}

      {/* Employee List */}
      <Route
        path="/employees"
        element={
          <PrivateRoute>
            <Employees />
          </PrivateRoute>
        }
      />

      {/* Add Employee */}
      <Route
        path="/employees/add"
        element={
          <PrivateRoute>
            <AddEmployee />
          </PrivateRoute>
        }
      />

      {/* Edit Employee */}
      <Route
        path="/employees/edit/:id"
        element={
          <PrivateRoute>
            <EditEmployee />
          </PrivateRoute>
        }
      />


      {/* =====================================
          ATTENDANCE MODULE
      ===================================== */}

      <Route
        path="/attendance"
        element={
          <PrivateRoute>
            <div>Attendance Page</div>
          </PrivateRoute>
        }
      />


      {/* =====================================
          DEPARTMENT MODULE
      ===================================== */}

      <Route
        path="/departments"
        element={
          <PrivateRoute>
            <div>Departments Page</div>
          </PrivateRoute>
        }
      />


      {/* =====================================
          SALES / CRM MODULE
      ===================================== */}

      <Route
        path="/sales"
        element={
          <PrivateRoute>
            <div>Sales / CRM Page</div>
          </PrivateRoute>
        }
      />


      {/* =====================================
          INVENTORY MODULE
      ===================================== */}

      <Route
        path="/inventory"
        element={
          <PrivateRoute>
            <div>Inventory Page</div>
          </PrivateRoute>
        }
      />


      {/* =====================================
          REPORTS / BUSINESS INTELLIGENCE
      ===================================== */}

      <Route
        path="/reports"
        element={
          <PrivateRoute>
            <div>Reports / Business Intelligence Page</div>
          </PrivateRoute>
        }
      />


      {/* =====================================
          PROFILE
      ===================================== */}

      <Route
        path="/profile"
        element={
          <PrivateRoute>
            <Profile />
          </PrivateRoute>
        }
      />


      {/* =====================================
          UNKNOWN URL
      ===================================== */}

      <Route
        path="*"
        element={<Navigate to="/login" replace />}
      />

    </Routes>
  );
}

export default App;

