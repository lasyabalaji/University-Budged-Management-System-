'use client'
import { useEffect, useState } from 'react'
import { api } from '@/lib/api'
import type { StudentScholarship } from '@/types'
import PageLayout from '@/components/PageLayout'
import DataTable from '@/components/DataTable'
import StatusBadge from '@/components/StatusBadge'

type Action = 'approve' | 'reject' | 'hold'

const FILTERS = ['pending', 'on_hold', 'approved', 'rejected'] as const
const FILTER_LABELS: Record<string, string> = {
  pending: 'Pending',
  on_hold: 'On Hold',
  approved: 'Approved',
  rejected: 'Rejected',
}

export default function ApplicationsPage() {
  const [rows,    setRows]    = useState<StudentScholarship[]>([])
  const [error,   setError]   = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [filter,  setFilter]  = useState('pending')

  function load(status = filter) {
    setLoading(true)
    api.get<StudentScholarship[]>(`/dean/scholarship-applications?status=${status}`)
      .then(setRows).catch(e => setError(e.message)).finally(() => setLoading(false))
  }
  useEffect(() => load(), [])

  async function decide(student_id: number, scholarship_id: number, action: Action) {
    setError(null)
    try {
      await api.put(`/dean/scholarship-applications/${student_id}/${scholarship_id}`, { action })
      const labels: Record<Action, string> = { approve: 'Approved', reject: 'Rejected', hold: 'Put on hold' }
      setSuccess(labels[action])
      load()
    } catch (e: unknown) { setError(e instanceof Error ? e.message : 'Error') }
  }

  const cols = [
    { header: 'Student',     key: 'student_id',
      render: (r: StudentScholarship) => (
        <div>
          <p className="font-medium text-sm">{r.first_name} {r.last_name}</p>
          <p className="text-xs text-slate-400">{r.email}</p>
        </div>
      )
    },
    { header: 'Scholarship', key: 'scholarship_name',
      render: (r: StudentScholarship) => (
        <div>
          <p className="text-sm">{r.scholarship_name}</p>
          <span className={`text-xs font-medium px-1.5 py-0.5 rounded-full ${
            r.scholarship_type === 'percent'
              ? 'bg-blue-100 text-blue-700'
              : 'bg-amber-100 text-amber-700'
          }`}>
            {r.scholarship_type === 'percent'
              ? `${r.percent_coverage}% / semester`
              : `Fixed $${Number(r.fixed_amount).toLocaleString()}`}
          </span>
        </div>
      )
    },
    { header: 'Pool Left',   key: 'remaining_balance',
      render: (r: StudentScholarship) => (
        r.scholarship_type === 'fixed'
          ? `$${Number(r.remaining_balance).toLocaleString()}`
          : <span className="text-slate-400 text-xs">N/A</span>
      )
    },
    { header: 'Awarded',     key: 'percent_discount',
      render: (r: StudentScholarship) =>
        r.percent_discount != null
          ? <span className="text-blue-700 font-medium text-xs">{r.percent_discount}% / sem</span>
          : r.fixed_award != null
            ? <span className="text-amber-700 font-medium text-xs">${Number(r.fixed_award).toLocaleString()}</span>
            : '—'
    },
    { header: 'Status',      key: 'status',
      render: (r: StudentScholarship) => <StatusBadge value={r.status} />
    },
    { header: 'Actions',     key: 'scholarship_id',
      render: (r: StudentScholarship) => {
        if (r.status === 'pending' || r.status === 'on_hold') {
          return (
            <div className="flex gap-1.5">
              <button onClick={() => decide(r.student_id, r.scholarship_id, 'approve')}
                className="bg-green-100 text-green-700 hover:bg-green-200 px-2 py-1 rounded text-xs font-medium">
                Approve
              </button>
              <button onClick={() => decide(r.student_id, r.scholarship_id, 'hold')}
                className="bg-yellow-100 text-yellow-700 hover:bg-yellow-200 px-2 py-1 rounded text-xs font-medium">
                {r.status === 'on_hold' ? 'Keep Hold' : 'Hold'}
              </button>
              <button onClick={() => decide(r.student_id, r.scholarship_id, 'reject')}
                className="bg-red-100 text-red-700 hover:bg-red-200 px-2 py-1 rounded text-xs font-medium">
                Reject
              </button>
            </div>
          )
        }
        return <span className="text-slate-400 text-xs">—</span>
      }
    },
  ]

  return (
    <PageLayout title="Scholarship Applications" error={error} success={success}>
      {/* Filter tabs */}
      <div className="flex gap-2 mb-4">
        {FILTERS.map(s => (
          <button key={s} onClick={() => { setFilter(s); load(s) }}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-colors
              ${filter === s
                ? 'bg-green-700 text-white'
                : 'bg-white border border-slate-300 text-slate-600 hover:bg-slate-50'}`}>
            {FILTER_LABELS[s]}
          </button>
        ))}
      </div>

      {loading ? <p className="text-slate-500">Loading…</p> : (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
          <DataTable columns={cols} rows={rows} />
        </div>
      )}
    </PageLayout>
  )
}
