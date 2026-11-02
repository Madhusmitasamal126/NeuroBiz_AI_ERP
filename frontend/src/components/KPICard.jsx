export default function KPICard({
  title,
  value,
  subtitle,
  icon,
  color = "primary",
}) {
  return (
    <div className="card kpi-card border-0 shadow-sm h-100">

      <div className="card-body">

        <div className="d-flex justify-content-between align-items-start">

          <div>
            <p className="text-muted mb-2">
              {title}
            </p>

            <h3 className="fw-bold mb-1">
              {value}
            </h3>

            <small className="text-muted">
              {subtitle}
            </small>
          </div>

          <div
            className={`kpi-icon bg-${color}`}
          >
            <i
              className={`bi ${icon}`}
            ></i>
          </div>

        </div>

      </div>

    </div>
  );
}