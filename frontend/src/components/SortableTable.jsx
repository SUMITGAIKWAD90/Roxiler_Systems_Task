export default function SortableTable({ columns, data, sortBy, sortOrder, onSort, rowKey = 'id' }) {
  const handleSort = (field) => {
    if (!field.sortable) return;
    const newOrder = sortBy === field.key && sortOrder === 'asc' ? 'desc' : 'asc';
    onSort(field.key, newOrder);
  };

  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            {columns.map((col) => (
              <th
                key={col.key}
                className={col.sortable ? 'sortable' : ''}
                onClick={() => col.sortable && handleSort(col)}
              >
                {col.label}
                {col.sortable && sortBy === col.key && (
                  <span style={{ marginLeft: '0.35rem', color: 'var(--primary)' }}>
                    {sortOrder === 'asc' ? '↑' : '↓'}
                  </span>
                )}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.length === 0 ? (
            <tr>
              <td colSpan={columns.length}>
                <div className="empty-state" style={{ padding: '2rem' }}>
                  <div className="empty-state__icon">📋</div>
                  No records found
                </div>
              </td>
            </tr>
          ) : (
            data.map((row, i) => (
              <tr key={row[rowKey]} style={{ animationDelay: `${i * 0.03}s` }}>
                {columns.map((col) => (
                  <td key={col.key}>{col.render ? col.render(row) : row[col.key]}</td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
