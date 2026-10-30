'use client'
import { useEffect, useState } from 'react'
import { api } from '@/lib/api'
import type { UtilityBill } from '@/types'
import PageLayout from '@/components/PageLayout'
import DataTable from '@/components/DataTable'
import StatusBadge from '@/components/StatusBadge'
import Modal from '@/components/Modal'

const blank = { building_name: '', building_type: '', utility_type: 'electricity', amount: 0, billing_month: new Date().getMonth() + 1, billing_year: new Date().getFullYear(), payment_status: 'unpaid' }

export default function UtilityBillsPage() {
  const [rows,        setRows]        = useState<UtilityBill[]>([])
  const [error,       setError]       = useState<string | null>(null)
  const [success,     setSuccess]     = useState<string | null>(null)
  const [loading,     setLoading]     = useState(true)
  const [modal,       setModal]       = useState(false)
  const [form,        setForm]        = useState<Record<string, unknown>>(blank)
  const [saving,      setSaving]      = useState(false)
  const [year,        setYear]        = useState('')
  const [status,      setStatus]      = useState('')
  const [utilityType, setUtilityType] = useState('')

  function load() {
    setLoading(true)
    const params = new URLSearchParams()
    if (year)        params.set('year',         year)
    if (status)      params.set('status',       status)
    if (utilityType) params.set('utility_type', utilityType)
    api.get<UtilityBill[]>(`/finance/utility-bills?${params}`)
      .then(setRows).catch(e => setError(e.message)).finally(() => setLoading(false))
  }
  useEffect(load, [])

  function field(k: string, v: unknown) { setForm(f => ({ ...f, [k]: v })) }

  async function save() {
    setSaving(true); setError(null)
    try {
      await api.post('/finance/utility-bills', form)
      setSuccess('Bill created'); setModal(false); load()
    } catch (e: unknown) { setError(e instanceof Error ? e.message : 'Error') }
    finally { setSaving(false) }
  }

  async function markPaid(bill_id: number) {
    try {
      await api.put(`/finance/utility-bills/${bill_id}`, { payment_status: 'paid' })
      setSuccess('Bill marked as paid'); load()
    } catch (e: unknown) { setError(e instanceof Error ? e.message : 'Error') }
  }

  async function del(bill_id: number) {
    if (!confirm('Delete this bill?')) return
    try {
      await api.delete(`/finance/utility-bills/${bill_id}`)
      setSuccess('Bill deleted'); load()
    } catch (e: unknown) { setError(e instanceof Error ? e.message : 'Error') }
  }

  const F = form as Record<string, unknown>
  const cols = [
    { header: 'Building',  key: 'building_name' },
    { header: 'Type',      key: 'building_type' },
    { header: 'Utility',   key: 'utility_type' },
    { header: 'Amount',    key: 'amount',   render: (r: UtilityBill) => `$${Number(r.amount).toLocaleString()}` },
    { header: 'Period',    key: 'billing_month', render: (r: UtilityBill) => `${r.billing_month}/${r.billing_year}` },
    { header: 'Status',    key: 'payment_status', render: (r: UtilityBill) => <StatusBadge value={r.payment_status} /> },
    { header: 'Actions',   key: 'bill_id', render: (r: UtilityBill) => (
      <div className="flex gap-2">
        {r.payment_status !== 'paid' && (
          <button onClick={() => markPaid(r.bill_id)} className="text-green-600 hover:underline text-xs">Mark Paid</button>
        )}
        <button onClick={() => del(r.bill_id)} className="text-red-500 hover:underline text-xs">Delete</button>
      </div>
    )},
  ]

  return (
    <PageLayout title="Utility Bills" error={error} success={success}
      action={<button onClick={() => { setForm(blank); setModal(true) }}
        className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700">+ Add Bill</button>}>
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
          <label className="text-xs font-medium text-slate-500 uppercase">Utility Type</label>
          <select value={utilityType} onChange={e => setUtilityType(e.target.value)}
            className="border border-slate-300 rounded-lg px-3 py-2 text-sm">
            <option value="">All</option>
            {['electricity','water','gas','internet','heating','maintenance','other'].map(t => <option key={t}>{t}</option>)}
          </select>
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-slate-500 uppercase">Status</label>
          <select value={status} onChange={e => setStatus(e.target.value)}
            className="border border-slate-300 rounded-lg px-3 py-2 text-sm">
            <option value="">All</option>
            <option>unpaid</option><option>paid</option><option>overdue</option>
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
        <Modal title="Add Utility Bill" onClose={() => setModal(false)}>
          <div className="space-y-3">
            {[['Building Name','building_name','text'],['Building Type','building_type','text'],['Amount','amount','number'],['Billing Month','billing_month','number'],['Billing Year','billing_year','number']].map(([label, key, type]) => (
              <div key={key}>
                <label className="block text-xs font-medium text-slate-600 mb-1">{label}</label>
                <input type={type} value={String(F[key] ?? '')}
                  onChange={e => field(key, type === 'number' ? Number(e.target.value) : e.target.value)}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm" />
              </div>
            ))}
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Utility Type</label>
              <select value={String(F.utility_type)} onChange={e => field('utility_type', e.target.value)}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm">
                {['electricity','water','gas','internet','heating','other'].map(t => <option key={t}>{t}</option>)}
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
