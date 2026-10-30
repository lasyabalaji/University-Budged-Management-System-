'use client'
import { useEffect, useState } from 'react'
import { api } from '@/lib/api'
import type { TuitionFee } from '@/types'
import PageLayout from '@/components/PageLayout'
import DataTable from '@/components/DataTable'
import StatusBadge from '@/components/StatusBadge'

function fmt(n: number) { return `$${Number(n).toLocaleString('en-US', { minimumFractionDigits: 2 })}` }

export default function TuitionRevenuePage() {
  const [rows,    setRows]    = useState<TuitionFee[]>([])
  const [error,   setError]   = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [semester, setSemester] = useState('')
  const [year,     setYear]     = useState('')
  const [status,   setStatus]   = useState('')

  function load() {
    setLoading(true)
    const params = new URLSearchParams()
    if (semester) params.set('semester', semester)
    if (year)     params.set('year',     year)
    if (status)   params.set('status',   status)
    api.get<TuitionFee[]>(`/finance/tuition-revenue?${params}`)
      .then(setRows).catch(e => setError(e.message)).finally(() => setLoading(false))
  }
  useEffect(load, [])

  const total    = rows.reduce((s, r) => s + Number(r.total_amount), 0)
  const collected = rows.filter(r => r.payment_status === 'paid').reduce((s, r) => s + Number(r.total_amount), 0)

  const cols = [
    { header: 'Student',   key: 'student_id',   render: (r: TuitionFee) => `${r.first_name} ${r.last_name}` },
    { header: 'Semester',  key: 'semester_name', render: (r: TuitionFee) => `${r.semester_name} ${r.year}` },
    { header: 'Credits',   key: 'total_credit_hours' },
    { header: 'Amount',    key: 'total_amount',  render: (r: TuitionFee) => fmt(r.total_amount) },
    { header: 'Due',       key: 'due_date' },
    { header: 'Paid On',   key: 'payment_date',  render: (r: TuitionFee) => r.payment_date ?? '—' },
    { header: 'Method',    key: 'payment_method',render: (r: TuitionFee) => r.payment_method ?? '—' },
    { header: 'Status',    key: 'payment_status',render: (r: TuitionFee) => <StatusBadge value={r.payment_status} /> },
  ]

  return (
    <PageLayout title="Tuition Revenue" error={error}>
      {/* Summary */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm">
          <p className="text-xs text-slate-500 uppercase">Expected</p>
          <p className="text-xl font-bold text-slate-800">{fmt(total)}</p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm">
          <p className="text-xs text-slate-500 uppercase">Collected</p>
          <p className="text-xl font-bold text-green-600">{fmt(collected)}</p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm">
          <p className="text-xs text-slate-500 uppercase">Outstanding</p>
          <p className="text-xl font-bold text-red-500">{fmt(total - collected)}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-4 mb-4 flex-wrap items-end">
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-slate-500 uppercase">Semester</label>
          <select value={semester} onChange={e => setSemester(e.target.value)}
            className="border border-slate-300 rounded-lg px-3 py-2 text-sm">
            <option value="">All</option>
            <option>Fall</option><option>Spring</option><option>Summer</option>
          </select>
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-slate-500 uppercase">Year</label>
          <select value={year} onChange={e => setYear(e.target.value)}
            className="border border-slate-300 rounded-lg px-3 py-2 text-sm">
            <option value="">All</option>
            {Array.from({ length: 6 }, (_, i) => new Date().getFullYear() - i).map(y => (
              <option key={y}>{y}</option>
            ))}
          </select>
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-slate-500 uppercase">Status</label>
          <select value={status} onChange={e => setStatus(e.target.value)}
            className="border border-slate-300 rounded-lg px-3 py-2 text-sm">
            <option value="">All</option>
            <option>unpaid</option><option>paid</option><option>overdue</option><option>waived</option>
          </select>
        </div>
        <button onClick={load} className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700">
          Apply
        </button>
      </div>

      {loading ? <p className="text-slate-500">Loading…</p> : (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
          <DataTable columns={cols} rows={rows} />
        </div>
      )}
    </PageLayout>
  )
}
