import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const { user } = useAuth();

  const username =
    user?.username || "User";

  const firstLetter =
    username.charAt(0).toUpperCase();

  return (
    <nav className="top-navbar">

      <div>
        <h5 className="mb-0 fw-bold">
          NeuroBiz AI ERP
        </h5>

        <small className="text-muted">
          Enterprise Dashboard
        </small>
      </div>

      <div className="d-flex align-items-center gap-3">

        <div className="text-end d-none d-sm-block">
          <strong>
            {username}
          </strong>

          <div className="small text-muted">
            Administrator
          </div>
        </div>

        <div className="user-avatar">
          {firstLetter}
        </div>

      </div>

    </nav>
  );
}