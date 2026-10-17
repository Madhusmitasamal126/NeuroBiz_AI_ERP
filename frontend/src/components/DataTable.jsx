export default function DataTable({
  columns,
  data,
  actions,
}) {
  return (
    <div className="table-responsive">

      <table className="table table-hover align-middle">

        <thead>
          <tr>

            {columns.map((column) => (
              <th key={column.key}>
                {column.label}
              </th>
            ))}

            {actions && <th>Actions</th>}

          </tr>
        </thead>

        <tbody>

          {data.length === 0 ? (
            <tr>
              <td
                colSpan={
                  columns.length +
                  (actions ? 1 : 0)
                }
                className="text-center py-4"
              >
                No records found.
              </td>
            </tr>
          ) : (
            data.map((row, index) => (
              <tr key={row.id || index}>

                {columns.map((column) => (
                  <td key={column.key}>
                    {row[column.key] ?? "-"}
                  </td>
                ))}

                {actions && (
                  <td>
                    {actions(row)}
                  </td>
                )}

              </tr>
            ))
          )}

        </tbody>

      </table>

    </div>
  );
}