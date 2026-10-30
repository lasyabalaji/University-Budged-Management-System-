'use client'
import { useEffect, useState } from 'react'
import { api } from '@/lib/api'
import type { StaffPayment } from '@/types'
import PageLayout from '@/components/PageLayout'
import DataTable from '@/components/DataTable'
import StatusBadge from '@/components/StatusBadge'
import Modal from '@/components/Modal'

const now = new Date()
const blank = { staff_id: '', month: now.getMonth() + 1, year: now.getFullYear() }

export default function StaffPaymentsPage() {
  const [rows,    setRows]    = useState<StaffPayment[]>([])
  const [error,   setError]   = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [modal,   setModal]   = useState(false)
  const [form,    setForm]    = useState<Record<string, unknown>>(blank)
  const [saving,  setSaving]  = useState(false)

  function load() {
    api.get<StaffPayment[]>('/admin/staff-payments').then(setRows).catch(e => setError(e.message)).finally(() => setLoading(false))
  }
  useEffect(load, [])

  function field(k: string, v: unknown) { setForm(f => ({ ...f, [k]: v })) }

  async function save() {
    setSaving(true); setError(null)
    const F = form as Record<string, unknown>
    try {
      await api.post('/admin/staff-payments', { staff_id: Number(F.staff_id), month: Number(F.month), year: Number(F.year) })
      setSuccess('Staff payment processed'); setModal(false); load()
    } catch (e: unknown) { setError(e instanceof Error ? e.message : 'Error') }
    finally { setSaving(false) }
  }

  const F = form as Record<string, unknown>
  const cols = [
    { header: 'Staff',    key: 'staff_id',  render: (r: StaffPayment) => `${r.first_name} ${r.last_name}` },
    { header: 'Period',   key: 'month',     render: (r: StaffPayment) => `${r.month}/${r.year}` },
    { header: 'Gross',    key: 'gross_pay', render: (r: StaffPayment) => `$${Number(r.gross_pay).toFixed(2)}` },
    { header: 'Deductions',key:'deductions',render: (r: StaffPayment) => `$${Number(r.deductions).toFixed(2)}` },
    { header: 'Net Pay',  key: 'net_pay',   render: (r: StaffPayment) => `$${Number(r.net_pay).toFixed(2)}` },
    { header: 'Date',     key: 'payment_date', render: (r: StaffPayment) => r.payment_date ?? '—' },
    { header: 'Status',   key: 'payment_status', render: (r: StaffPayment) => <StatusBadge value={r.payment_status} /> },
  ]

  return (
    <PageLayout title="Staff Payments" error={error} success={success}
      action={<button onClick={() => { setForm(blank); setModal(true) }}
        className="bg-purple-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-purple-700">Process Payment</button>}>
      {loading ? <p className="text-slate-500">Loading…</p> : (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
          <DataTable columns={cols} rows={rows} />
        </div>
      )}
      {modal && (
        <Modal title="Process Staff Payment" onClose={() => setModal(false)}>
          <div className="space-y-3">
            {[['Staff ID','staff_id','number'],['Month (1-12)','month','number'],['Year','year','number']].map(([label, key, type]) => (
              <div key={key}>
                <label className="block text-xs font-medium text-slate-600 mb-1">{label}</label>
                <input type={type} value={String(F[key] ?? '')} onChange={e => field(key, e.target.value)}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm" />
              </div>
            ))}
            <p className="text-xs text-slate-400">Gross = annual salary ÷ 12. Deductions = 20%.</p>
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
