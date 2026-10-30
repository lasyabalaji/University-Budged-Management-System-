'use client'
import { useEffect, useState } from 'react'
import { api } from '@/lib/api'
import type { Payroll } from '@/types'
import PageLayout from '@/components/PageLayout'
import DataTable from '@/components/DataTable'
import StatusBadge from '@/components/StatusBadge'
import Modal from '@/components/Modal'

const today = new Date().toISOString().split('T')[0]
const blank = { student_id: '', job_id: '', hours_worked: '', period_start: today, period_end: today }

export default function PayrollPage() {
  const [rows,    setRows]    = useState<Payroll[]>([])
  const [error,   setError]   = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [modal,   setModal]   = useState(false)
  const [form,    setForm]    = useState<Record<string, unknown>>(blank)
  const [saving,  setSaving]  = useState(false)

  function load() {
    api.get<Payroll[]>('/admin/payroll').then(setRows).catch(e => setError(e.message)).finally(() => setLoading(false))
  }
  useEffect(load, [])

  function field(k: string, v: unknown) { setForm(f => ({ ...f, [k]: v })) }

  async function save() {
    setSaving(true); setError(null)
    const F = form as Record<string, unknown>
    try {
      await api.post('/admin/payroll', {
        student_id: Number(F.student_id), job_id: Number(F.job_id),
        hours_worked: Number(F.hours_worked), period_start: F.period_start, period_end: F.period_end,
      })
      setSuccess('Payroll processed'); setModal(false); load()
    } catch (e: unknown) { setError(e instanceof Error ? e.message : 'Error') }
    finally { setSaving(false) }
  }

  const F = form as Record<string, unknown>
  const cols = [
    { header: 'Student',      key: 'student_id', render: (r: Payroll) => `${r.first_name} ${r.last_name}` },
    { header: 'Job',          key: 'job_title' },
    { header: 'Period',       key: 'period_start', render: (r: Payroll) => `${r.period_start} → ${r.period_end}` },
    { header: 'Hours',        key: 'hours_worked' },
    { header: 'Gross Pay',    key: 'gross_pay',  render: (r: Payroll) => `$${Number(r.gross_pay).toFixed(2)}` },
    { header: 'Payment Date', key: 'payment_date', render: (r: Payroll) => r.payment_date ?? '—' },
    { header: 'Status',       key: 'payment_status', render: (r: Payroll) => <StatusBadge value={r.payment_status} /> },
  ]

  return (
    <PageLayout title="Student Payroll" error={error} success={success}
      action={<button onClick={() => { setForm(blank); setModal(true) }}
        className="bg-purple-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-purple-700">Process Payroll</button>}>
      {loading ? <p className="text-slate-500">Loading…</p> : (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
          <DataTable columns={cols} rows={rows} />
        </div>
      )}
      {modal && (
        <Modal title="Process Payroll" onClose={() => setModal(false)}>
          <div className="space-y-3">
            {[['Student ID','student_id','number'],['Job ID','job_id','number'],['Hours Worked','hours_worked','number'],['Period Start','period_start','date'],['Period End','period_end','date']].map(([label, key, type]) => (
              <div key={key}>
                <label className="block text-xs font-medium text-slate-600 mb-1">{label}</label>
                <input type={type} value={String(F[key] ?? '')}
                  onChange={e => field(key, e.target.value)}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm" />
              </div>
            ))}
          </div>
          <div className="flex justify-end gap-3 mt-5">
            <button onClick={() => setModal(false)} className="px-4 py-2 text-sm text-slate-600 hover:underline">Cancel</button>
            <button onClick={save} disabled={saving} className="bg-purple-600 text-white px-5 py-2 rounded-lg text-sm hover:bg-purple-700 disabled:opacity-60">
              {saving ? 'Processing…' : 'Process'}
            </button>
          </div>
        </Modal>
      )}
    </PageLayout>
  )
}
