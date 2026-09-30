
import { Routes, Route, Navigate } from "react-router-dom";

// Pages
import Login from "./pages/Login";
import Registration from "./pages/Registration";
import Dashboard from "./pages/DashBoard";

// Authentication
import PrivateRoute from "./routes/PrivateRoute";

function App() {
  return (
    <Routes>

      {/* =========================
          PUBLIC ROUTES
      ========================= */}

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


      {/* =========================
          PROTECTED ROUTES
      ========================= */}

      {/* Dashboard */}
      <Route
        path="/dashboard"
        element={
          <PrivateRoute>
            <Dashboard />
          </PrivateRoute>
        }
      />

      {/* Employees */}
      <Route
        path="/employees"
        element={
          <PrivateRoute>
            <div>Employees Page</div>
          </PrivateRoute>
        }
      />

      {/* Attendance */}
      <Route
        path="/attendance"
        element={
          <PrivateRoute>
            <div>Attendance Page</div>
          </PrivateRoute>
        }
      />

      {/* Departments */}
      <Route
        path="/departments"
        element={
          <PrivateRoute>
            <div>Departments Page</div>
          </PrivateRoute>
        }
      />

      {/* Sales / CRM */}
      <Route
        path="/sales"
        element={
          <PrivateRoute>
            <div>Sales Page</div>
          </PrivateRoute>
        }
      />

      {/* Inventory */}
      <Route
        path="/inventory"
        element={
          <PrivateRoute>
            <div>Inventory Page</div>
          </PrivateRoute>
        }
      />

      {/* Reports / Business Intelligence */}
      <Route
        path="/reports"
        element={
          <PrivateRoute>
            <div>Reports Page</div>
          </PrivateRoute>
        }
      />

      {/* Profile */}
      <Route
        path="/profile"
        element={
          <PrivateRoute>
            <div>Profile Page</div>
          </PrivateRoute>
        }
      />


      {/* =========================
          UNKNOWN URL
      ========================= */}

      <Route
        path="*"
        element={<Navigate to="/login" replace />}
      />

    </Routes>
  );
}

export default App;

