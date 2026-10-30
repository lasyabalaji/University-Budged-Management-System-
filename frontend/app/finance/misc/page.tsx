'use client'
import { useEffect, useState } from 'react'
import { api } from '@/lib/api'
import type { MiscPayment } from '@/types'
import PageLayout from '@/components/PageLayout'
import DataTable from '@/components/DataTable'
import StatusBadge from '@/components/StatusBadge'
import Modal from '@/components/Modal'

const today = new Date().toISOString().split('T')[0]
const blank = { description: '', category: '', item_name: '', amount: 0, payment_date: today, payment_status: 'pending' }

export default function MiscPaymentsPage() {
  const [rows,    setRows]    = useState<MiscPayment[]>([])
  const [error,   setError]   = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [modal,   setModal]   = useState(false)
  const [form,    setForm]    = useState<Record<string, unknown>>(blank)
  const [saving,  setSaving]  = useState(false)
  const [year,    setYear]    = useState('')
  const [status,  setStatus]  = useState('')

  function load() {
    setLoading(true)
    const params = new URLSearchParams()
    if (year)   params.set('year',   year)
    if (status) params.set('status', status)
    api.get<MiscPayment[]>(`/finance/misc-payments?${params}`)
      .then(setRows).catch(e => setError(e.message)).finally(() => setLoading(false))
  }
  useEffect(load, [])

  function field(k: string, v: unknown) { setForm(f => ({ ...f, [k]: v })) }

  async function save() {
    setSaving(true); setError(null)
    try {
      await api.post('/finance/misc-payments', form)
      setSuccess('Payment created'); setModal(false); load()
    } catch (e: unknown) { setError(e instanceof Error ? e.message : 'Error') }
    finally { setSaving(false) }
  }

  async function del(payment_id: number) {
    if (!confirm('Delete this payment?')) return
    try {
      await api.delete(`/finance/misc-payments/${payment_id}`)
      setSuccess('Payment deleted'); load()
    } catch (e: unknown) { setError(e instanceof Error ? e.message : 'Error') }
  }

  const F = form as Record<string, unknown>
  const cols = [
    { header: 'Item',     key: 'item_name' },
    { header: 'Category', key: 'category' },
    { header: 'Amount',   key: 'amount',   render: (r: MiscPayment) => `$${Number(r.amount).toLocaleString()}` },
    { header: 'Date',     key: 'payment_date' },
    { header: 'Status',   key: 'payment_status', render: (r: MiscPayment) => <StatusBadge value={r.payment_status} /> },
    { header: 'Actions',  key: 'payment_id', render: (r: MiscPayment) => (
      <button onClick={() => del(r.payment_id)} className="text-red-500 hover:underline text-xs">Delete</button>
    )},
  ]

  return (
    <PageLayout title="Miscellaneous Payments" error={error} success={success}
      action={<button onClick={() => { setForm(blank); setModal(true) }}
        className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700">+ Add Payment</button>}>
      <div className="flex gap-4 items-end mb-4 flex-wrap">
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-slate-500 uppercase">Year</label>
          <select value={year} onChange={e => setYear(e.target.value)}
            className="border border-slate-300 rounded-lg px-3 py-2 text-sm">
            <option value="">All</option>
            {Array.from({ length: 6 }, (_, i) => new Date().getFullYear() - i).map(y => <option key={y}>{y}</option>)}
          </select>
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-slate-500 uppercase">Status</label>
          <select value={status} onChange={e => setStatus(e.target.value)}
            className="border border-slate-300 rounded-lg px-3 py-2 text-sm">
            <option value="">All</option>
            <option>pending</option><option>paid</option>
          </select>
        </div>
        <button onClick={load} className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700">Apply</button>
      </div>

      {loading ? <p className="text-slate-500">Loading…</p> : (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
          <DataTable columns={cols} rows={rows} />
        </div>
      )}
      {modal && (
        <Modal title="Add Misc Payment" onClose={() => setModal(false)}>
          <div className="space-y-3">
            {[['Item Name','item_name','text'],['Category','category','text'],['Amount','amount','number'],['Payment Date','payment_date','date'],['Description','description','text']].map(([label, key, type]) => (
              <div key={key}>
                <label className="block text-xs font-medium text-slate-600 mb-1">{label}</label>
                <input type={type} value={String(F[key] ?? '')}
                  onChange={e => field(key, type === 'number' ? Number(e.target.value) : e.target.value)}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm" />
              </div>
            ))}
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Status</label>
              <select value={String(F.payment_status)} onChange={e => field('payment_status', e.target.value)}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm">
                <option>pending</option><option>paid</option>
              </select>
            </div>
          </div>
          <div className="flex justify-end gap-3 mt-5">
            <button onClick={() => setModal(false)} className="px-4 py-2 text-sm text-slate-600 hover:underline">Cancel</button>
            <button onClick={save} disabled={saving} className="bg-blue-600 text-white px-5 py-2 rounded-lg text-sm hover:bg-blue-700 disabled:opacity-60">
              {saving ? 'Saving…' : 'Add'}
            </button>
          </div>
        </Modal>
      )}
    </PageLayout>
  )
}
