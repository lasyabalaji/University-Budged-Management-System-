'use client'
import { useEffect, useState } from 'react'
import { api } from '@/lib/api'
import PageLayout from '@/components/PageLayout'
import DataTable from '@/components/DataTable'
import StatusBadge from '@/components/StatusBadge'

interface ScholarshipAward {
  student_id:       number
  scholarship_id:   number
  first_name:       string
  last_name:        string
  email:            string
  scholarship_name: string
  scholarship_type: 'percent' | 'fixed'
  percent_coverage: number
  fixed_amount:     number
  original_amount:  number
  remaining_pool:   number
  status:           string
  award_date:       string | null
  percent_discount: number | null
  fixed_award:      number | null
}

function fmt(n: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n)
}

const STATUS_FILTERS = ['all', 'approved', 'pending', 'on_hold', 'rejected']

export default function FinanceScholarshipsPage() {
  const [rows,       setRows]       = useState<ScholarshipAward[]>([])
  const [error,      setError]      = useState<string | null>(null)
  const [loading,    setLoading]    = useState(true)
  const [statusFilter, setStatusFilter] = useState('all')

  useEffect(() => {
    api.get<ScholarshipAward[]>('/finance/scholarships')
      .then(setRows).catch(e => setError(e.message)).finally(() => setLoading(false))
  }, [])

  const filtered = statusFilter === 'all' ? rows : rows.filter(r => r.status === statusFilter)

  const fixedAwarded = rows
    .filter(r => r.status === 'approved' && r.scholarship_type === 'fixed')
    .reduce((s, r) => s + Number(r.fixed_award ?? 0), 0)

  const percentApproved = rows
    .filter(r => r.status === 'approved' && r.scholarship_type === 'percent')
    .length

  const cols = [
    { header: 'Student', key: 'student_id', render: (r: ScholarshipAward) => (
      <div>
        <p className="font-medium text-sm">{r.first_name} {r.last_name}</p>
        <p className="text-xs text-slate-400">{r.email}</p>
      </div>
    )},
    { header: 'Scholarship', key: 'scholarship_name', render: (r: ScholarshipAward) => (
      <div>
        <p className="text-sm">{r.scholarship_name}</p>
        <span className={`text-xs font-medium px-1.5 py-0.5 rounded-full ${
          r.scholarship_type === 'percent'
            ? 'bg-blue-100 text-blue-700'
            : 'bg-amber-100 text-amber-700'
        }`}>
          {r.scholarship_type === 'percent' ? 'Percent' : 'Fixed'}
        </span>
      </div>
    )},
    { header: 'Awarded', key: 'percent_discount', render: (r: ScholarshipAward) => (
      r.scholarship_type === 'percent'
        ? <span className="text-blue-700 font-medium text-xs">{r.percent_discount}% / sem</span>
        : r.fixed_award != null ? fmt(r.fixed_award) : '—'
    )},
    { header: 'Award Date', key: 'award_date', render: (r: ScholarshipAward) => r.award_date ?? '—' },
    { header: 'Status', key: 'status', render: (r: ScholarshipAward) => <StatusBadge value={r.status} /> },
  ]

  return (
    <PageLayout title="Scholarship Awards" error={error}>

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-xl p-4 border-l-4 border-red-400 shadow-sm">
          <p className="text-xs text-slate-500 uppercase">Total Fixed Awards Paid Out</p>
          <p className="text-xl font-bold text-slate-800">{fmt(fixedAwarded)}</p>
          <p className="text-xs text-slate-400 mt-0.5">from scholarship pools</p>
        </div>
        <div className="bg-white rounded-xl p-4 border-l-4 border-blue-500 shadow-sm">
          <p className="text-xs text-slate-500 uppercase">Percent Scholarships Active</p>
          <p className="text-xl font-bold text-slate-800">{percentApproved}</p>
          <p className="text-xs text-slate-400 mt-0.5">students receiving % discount / semester</p>
        </div>
        <div className="bg-white rounded-xl p-4 border-l-4 border-slate-400 shadow-sm">
          <p className="text-xs text-slate-500 uppercase">Total Applications</p>
          <p className="text-xl font-bold text-slate-800">{rows.length}</p>
          <p className="text-xs text-slate-400 mt-0.5">across all statuses</p>
        </div>
      </div>

      {/* Status filter */}
      <div className="flex gap-2 mb-4 flex-wrap">
        {STATUS_FILTERS.map(s => (
          <button key={s} onClick={() => setStatusFilter(s)}
            className={`px-3 py-1 rounded-full text-xs font-medium capitalize transition-colors
              ${statusFilter === s
                ? 'bg-blue-700 text-white'
                : 'bg-white border border-slate-300 text-slate-600 hover:bg-slate-50'}`}>
            {s === 'all' ? 'All' : s === 'on_hold' ? 'On Hold' : s.charAt(0).toUpperCase() + s.slice(1)}
          </button>
        ))}
      </div>

      {loading ? <p className="text-slate-500">Loading…</p> : (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
          <DataTable columns={cols} rows={filtered} />
        </div>
      )}
    </PageLayout>
  )
}
