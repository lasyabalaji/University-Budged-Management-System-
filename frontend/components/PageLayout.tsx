interface Props {
  title:    string
  action?:  React.ReactNode
  children: React.ReactNode
  error?:   string | null
  success?: string | null
}

export default function PageLayout({ title, action, children, error, success }: Props) {
  return (
    <div className="p-6 max-w-7xl">
      {/* Alerts */}
      {error   && <div className="mb-4 rounded-lg bg-red-50 border border-red-200 text-red-700 px-4 py-3 text-sm">{error}</div>}
      {success && <div className="mb-4 rounded-lg bg-green-50 border border-green-200 text-green-700 px-4 py-3 text-sm">{success}</div>}

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-slate-800">{title}</h1>
        {action}
      </div>

      {children}
    </div>
  )
}
