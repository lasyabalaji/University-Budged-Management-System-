interface Column<T> {
  header: string
  key:    keyof T | string
  render?: (row: T) => React.ReactNode
}

interface Props<T> {
  columns: Column<T>[]
  rows:    T[]
  empty?:  string
}

export default function DataTable<T extends object>({ columns, rows, empty = 'No records found.' }: Props<T>) {
  if (rows.length === 0) {
    return <p className="text-slate-500 text-sm py-6 text-center">{empty}</p>
  }
  return (
    <div className="overflow-x-auto rounded-lg border border-slate-200">
      <table className="min-w-full text-sm">
        <thead className="bg-slate-50 border-b border-slate-200">
          <tr>
            {columns.map(col => (
              <th key={String(col.key)} className="px-4 py-3 text-left font-semibold text-slate-600 whitespace-nowrap">
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {rows.map((row, i) => (
            <tr key={i} className="hover:bg-slate-50 transition-colors">
              {columns.map(col => (
                <td key={String(col.key)} className="px-4 py-3 text-slate-700 whitespace-nowrap">
                  {col.render
                    ? col.render(row)
                    : String((row as Record<string, unknown>)[col.key as string] ?? '')}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
