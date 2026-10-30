'use client'
import { useEffect, useState } from 'react'
import { api } from '@/lib/api'
import { authStore } from '@/lib/auth'
import type { Payroll } from '@/types'
import PageLayout from '@/components/PageLayout'
import DataTable from '@/components/DataTable'
import StatusBadge from '@/components/StatusBadge'

export default function StudentPayrollPage() {
  const user = authStore.get()
  const studentId = user?.student_id

  const [rows,    setRows]    = useState<(Payroll & { total_earnings?: number })[]>([])
  const [error,   setError]   = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!studentId) return
    api.get<(Payroll & { total_earnings?: number })[]>(`/student/${studentId}/payroll`)
      .then(setRows).catch(e => setError(e.message)).finally(() => setLoading(false))
  }, [])

  const totalEarnings = rows[0]?.total_earnings ?? 0
  const totalHours    = rows.reduce((s, r) => s + Number(r.hours_worked), 0)

  const cols = [
    { header: 'Job',          key: 'job_title' },
    { header: 'Period',       key: 'period_start', render: (r: Payroll) => `${r.period_start} → ${r.period_end}` },
    { header: 'Hours',        key: 'hours_worked' },
    { header: 'Hourly Rate',  key: 'hourly_rate',  render: (r: Payroll) => `$${Number(r.hourly_rate).toFixed(2)}/hr` },
    { header: 'Gross Pay',    key: 'gross_pay',    render: (r: Payroll) => `$${Number(r.gross_pay).toFixed(2)}` },
    { header: 'Payment Date', key: 'payment_date', render: (r: Payroll) => r.payment_date ?? '—' },
    { header: 'Status',       key: 'payment_status', render: (r: Payroll) => <StatusBadge value={r.payment_status} /> },
  ]

  return (
    <PageLayout title="My Payroll" error={error}>
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm">
          <p className="text-xs text-slate-500 uppercase">Total Earned (Paid)</p>
          <p className="text-xl font-bold text-green-600">${Number(totalEarnings).toFixed(2)}</p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm">
          <p className="text-xs text-slate-500 uppercase">Total Hours</p>
          <p className="text-xl font-bold text-slate-800">{totalHours.toFixed(1)} hrs</p>
        </div>
      </div>
      {loading ? <p className="text-slate-500">Loading…</p> : (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
          <DataTable columns={cols} rows={rows} empty="No payroll records found." />
        </div>
      )}
    </PageLayout>
  )
}
