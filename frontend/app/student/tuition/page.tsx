'use client'
import { useEffect, useState } from 'react'
import { api } from '@/lib/api'
import { authStore } from '@/lib/auth'
import type { TuitionFee } from '@/types'
import PageLayout from '@/components/PageLayout'
import DataTable from '@/components/DataTable'
import StatusBadge from '@/components/StatusBadge'
import Modal from '@/components/Modal'

interface ScholarshipRecord {
  scholarship_id:   number
  scholarship_name: string
  scholarship_type: 'percent' | 'fixed'
  status:           string
  percent_discount: number | null
  fixed_award:      number | null
}

function fmt(n: number) { return `$${Number(n).toLocaleString('en-US', { minimumFractionDigits: 2 })}` }

export default function StudentTuitionPage() {
  const user      = authStore.get()
  const studentId = user?.student_id

  const [rows,         setRows]         = useState<TuitionFee[]>([])
  const [scholarships, setScholarships] = useState<ScholarshipRecord[]>([])
  const [error,        setError]        = useState<string | null>(null)
  const [success,      setSuccess]      = useState<string | null>(null)
  const [loading,      setLoading]      = useState(true)
  const [payModal,     setPayModal]     = useState<TuitionFee | null>(null)
  const [method,       setMethod]       = useState('Online Portal')
  const [saving,       setSaving]       = useState(false)

  function load() {
    if (!studentId) return
    Promise.all([
      api.get<TuitionFee[]>(`/student/${studentId}/tuition`),
      api.get<ScholarshipRecord[]>(`/student/${studentId}/scholarships`),
    ])
      .then(([t, s]) => { setRows(t); setScholarships(s) })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false))
  }
  useEffect(load, [])

  async function pay() {
    if (!payModal) return
    setSaving(true); setError(null)
    try {
      await api.put(`/student/tuition/${payModal.fee_id}/pay`, { payment_method: method })
      setSuccess('Tuition fee paid successfully!')
      setPayModal(null)
      load()
    } catch (e: unknown) { setError(e instanceof Error ? e.message : 'Error') }
    finally { setSaving(false) }
  }

  const unpaidRows = rows.filter(r => r.payment_status !== 'paid' && r.payment_status !== 'waived')

  const totalPaid = rows
    .filter(r => r.payment_status === 'paid')
    .reduce((s, r) => s + Number(r.total_amount), 0)

  const outstanding = unpaidRows.reduce((s, r) => s + Number(r.total_amount), 0)

  const fixedCredit = scholarships
    .filter(s => s.status === 'approved' && s.scholarship_type === 'fixed')
    .reduce((s, r) => s + Number(r.fixed_award ?? 0), 0)

  const hasPercentScholarship = scholarships.some(
    s => s.status === 'approved' && s.scholarship_type === 'percent'
  )

  const netOwed = outstanding - fixedCredit

  const cols = [
    { header: 'Semester',  key: 'semester_name', render: (r: TuitionFee) => `${r.semester_name} ${r.year}` },
    { header: 'Credits',   key: 'total_credit_hours' },
    { header: 'Amount',    key: 'total_amount',   render: (r: TuitionFee) => fmt(r.total_amount) },
    { header: 'Due Date',  key: 'due_date' },
    { header: 'Paid On',   key: 'payment_date',   render: (r: TuitionFee) => r.payment_date ?? '—' },
    { header: 'Method',    key: 'payment_method', render: (r: TuitionFee) => r.payment_method ?? '—' },
    { header: 'Status',    key: 'payment_status', render: (r: TuitionFee) => <StatusBadge value={r.payment_status} /> },
    { header: 'Actions',   key: 'fee_id', render: (r: TuitionFee) => (
      r.payment_status !== 'paid' && r.payment_status !== 'waived' ? (
        <button onClick={() => setPayModal(r)}
          className="bg-teal-600 text-white px-3 py-1 rounded text-xs font-medium hover:bg-teal-700">
          Pay Now
        </button>
      ) : <span className="text-slate-400 text-xs">—</span>
    )},
  ]

  return (
    <PageLayout title="My Tuition Fees" error={error} success={success}>

      {/* Balance summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm">
          <p className="text-xs text-slate-500 uppercase">Outstanding</p>
          <p className="text-xl font-bold text-slate-700">{fmt(outstanding)}</p>
          {hasPercentScholarship && (
            <p className="text-xs text-blue-600 mt-0.5">% discount already applied</p>
          )}
        </div>

        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm">
          <p className="text-xs text-slate-500 uppercase">Fixed Scholarship Credit</p>
          <p className="text-xl font-bold text-blue-600">
            {fixedCredit > 0 ? `− ${fmt(fixedCredit)}` : '—'}
          </p>
          {fixedCredit > 0 && <p className="text-xs text-slate-400 mt-0.5">one-time deduction</p>}
        </div>

        <div className={`bg-white rounded-xl p-4 border-2 shadow-sm ${netOwed < 0 ? 'border-green-400' : 'border-teal-400'}`}>
          <p className="text-xs text-slate-500 uppercase">
            {netOwed < 0 ? 'Credit Balance' : 'Net Balance Due'}
          </p>
          <p className={`text-xl font-bold ${netOwed < 0 ? 'text-green-600' : netOwed === 0 ? 'text-slate-500' : 'text-red-500'}`}>
            {fmt(Math.abs(netOwed))}
          </p>
          {netOwed < 0 && (
            <p className="text-xs text-green-600 mt-0.5">scholarship exceeds tuition</p>
          )}
        </div>

        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm">
          <p className="text-xs text-slate-500 uppercase">Total Paid</p>
          <p className="text-xl font-bold text-green-600">{fmt(totalPaid)}</p>
        </div>
      </div>

      {loading ? <p className="text-slate-500">Loading…</p> : (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
          <DataTable columns={cols} rows={rows} />
        </div>
      )}

      {payModal && (
        <Modal title={`Pay Tuition — ${payModal.semester_name} ${payModal.year}`} onClose={() => setPayModal(null)}>
          <p className="text-sm text-slate-600 mb-1">
            Semester amount: <strong className="text-slate-800">{fmt(payModal.total_amount)}</strong>
          </p>
          {fixedCredit > 0 && (
            <p className="text-xs text-blue-600 mb-4">
              Note: your fixed scholarship credit of {fmt(fixedCredit)} is reflected in your Net Balance Due above.
            </p>
          )}
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Payment Method</label>
            <select value={method} onChange={e => setMethod(e.target.value)}
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm">
              {['Online Portal','Bank Transfer','Credit Card','Financial Aid','Check'].map(m => (
                <option key={m}>{m}</option>
              ))}
            </select>
          </div>
          <div className="flex justify-end gap-3 mt-5">
            <button onClick={() => setPayModal(null)} className="px-4 py-2 text-sm text-slate-600 hover:underline">Cancel</button>
            <button onClick={pay} disabled={saving}
              className="bg-teal-600 text-white px-5 py-2 rounded-lg text-sm hover:bg-teal-700 disabled:opacity-60">
              {saving ? 'Processing…' : `Pay ${fmt(payModal.total_amount)}`}
            </button>
          </div>
        </Modal>
      )}
    </PageLayout>
  )
}
