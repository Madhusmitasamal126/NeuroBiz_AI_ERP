import {
  NavLink,
  useNavigate,
} from "react-router-dom";

import { useAuth } from "../context/AuthContext";

const menuItems = [
  {
    name: "Dashboard",
    path: "/dashboard",
    icon: "bi-speedometer2",
  },
  {
    name: "Employees",
    path: "/employees",
    icon: "bi-people",
  },
  {
    name: "Attendance",
    path: "/attendance",
    icon: "bi-calendar-check",
  },
  {
    name: "Departments",
    path: "/departments",
    icon: "bi-diagram-3",
  },
  {
    name: "Sales",
    path: "/sales",
    icon: "bi-cart3",
  },
  {
    name: "Inventory",
    path: "/inventory",
    icon: "bi-box-seam",
  },
  {
    name: "Analytics",
    path: "/analytics",
    icon: "bi-graph-up-arrow",
  },
  {
    name: "Reports",
    path: "/reports",
    icon: "bi-bar-chart",
  },
  {
    name: "Profile",
    path: "/profile",
    icon: "bi-person-circle",
  },
];

export default function Sidebar() {
  const navigate = useNavigate();

  const { logout } = useAuth();

  const handleLogout = () => {
    logout();

    navigate("/login");
  };

  return (
    <aside className="sidebar bg-dark text-white">

      {/* BRAND */}
      <div className="sidebar-brand">
        <h4 className="mb-0">
          NeuroBiz
        </h4>

        <small>
          AI ERP
        </small>
      </div>

      {/* MENU */}
      <nav className="sidebar-menu">

        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `sidebar-link ${
                isActive ? "active" : ""
              }`
            }
          >
            <i
              className={`bi ${item.icon}`}
            ></i>

            <span>
              {item.name}
            </span>
          </NavLink>
        ))}

        {/* LOGOUT */}
        <button
          type="button"
          className="sidebar-link logout-button"
          onClick={handleLogout}
        >
          <i className="bi bi-box-arrow-right"></i>

          <span>
            Logout
          </span>
        </button>

      </nav>
    </aside>
  );
}