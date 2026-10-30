'use client'
import { useEffect, useState } from 'react'
import { api } from '@/lib/api'
import type { TaxFiling } from '@/types'
import PageLayout from '@/components/PageLayout'
import DataTable from '@/components/DataTable'
import StatusBadge from '@/components/StatusBadge'
import Modal from '@/components/Modal'

function fmt(n: number) { return `$${Number(n).toLocaleString()}` }
const blank = { fiscal_year: new Date().getFullYear(), filing_date: '', filing_status: 'pending', total_income: 0, total_deductions: 0, employee_compensation: 0, capital_expenditures: 0, research_credits: 0, tax_liability: 0 }

export default function TaxFilingsPage() {
  const [rows,    setRows]    = useState<TaxFiling[]>([])
  const [error,   setError]   = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [modal,   setModal]   = useState<'create' | 'edit' | null>(null)
  const [form,    setForm]    = useState<Record<string, unknown>>(blank)
  const [saving,  setSaving]  = useState(false)
  const [year,    setYear]    = useState('')
  const [status,  setStatus]  = useState('')

  function load() {
    setLoading(true)
    const params = new URLSearchParams()
    if (year)   params.set('year',   year)
    if (status) params.set('status', status)
    api.get<TaxFiling[]>(`/finance/tax-filings?${params}`)
      .then(setRows).catch(e => setError(e.message)).finally(() => setLoading(false))
  }
  useEffect(load, [])

  function field(k: string, v: unknown) { setForm(f => ({ ...f, [k]: v })) }

  async function save() {
    setSaving(true); setError(null)
    try {
      if (modal === 'create') {
        await api.post('/finance/tax-filings', form)
        setSuccess('Tax filing created')
      } else {
        await api.put(`/finance/tax-filings/${(form as unknown as TaxFiling).filing_id}`, form)
        setSuccess('Tax filing updated')
      }
      setModal(null); load()
    } catch (e: unknown) { setError(e instanceof Error ? e.message : 'Error') }
    finally { setSaving(false) }
  }

  const cols = [
    { header: 'Year',         key: 'fiscal_year' },
    { header: 'Filing Date',  key: 'filing_date', render: (r: TaxFiling) => r.filing_date ?? '—' },
    { header: 'Status',       key: 'filing_status', render: (r: TaxFiling) => <StatusBadge value={r.filing_status} /> },
    { header: 'Total Income', key: 'total_income',  render: (r: TaxFiling) => fmt(r.total_income) },
    { header: 'Deductions',   key: 'total_deductions', render: (r: TaxFiling) => fmt(r.total_deductions) },
    { header: 'Tax Liability',key: 'tax_liability', render: (r: TaxFiling) => fmt(r.tax_liability) },
    { header: 'Actions', key: 'filing_id', render: (r: TaxFiling) => (
      <button onClick={() => { setForm(r as unknown as Record<string, unknown>); setModal('edit') }}
        className="text-blue-600 hover:underline text-xs">Edit</button>
    )},
  ]

  const F = (form as Record<string, unknown>)

  return (
    <PageLayout title="Tax Filings" error={error} success={success}
      action={<button onClick={() => { setForm(blank); setModal('create') }}
        className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700">
        + New Filing
      </button>}>
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
            <option>pending</option><option>filed</option><option>audited</option>
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
        <Modal title={modal === 'create' ? 'New Tax Filing' : 'Edit Tax Filing'} onClose={() => setModal(null)} wide>
          <div className="grid grid-cols-2 gap-4">
            {[
              ['Fiscal Year','fiscal_year','number'],
              ['Filing Date','filing_date','date'],
              ['Total Income','total_income','number'],
              ['Total Deductions','total_deductions','number'],
              ['Employee Compensation','employee_compensation','number'],
              ['Capital Expenditures','capital_expenditures','number'],
              ['Research Credits','research_credits','number'],
              ['Tax Liability','tax_liability','number'],
            ].map(([label, key, type]) => (
              <div key={key}>
                <label className="block text-xs font-medium text-slate-600 mb-1">{label}</label>
                <input type={type} value={String(F[key] ?? '')}
                  onChange={e => field(key, type === 'number' ? Number(e.target.value) : e.target.value)}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm" />
              </div>
            ))}
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Status</label>
              <select value={String(F.filing_status)} onChange={e => field('filing_status', e.target.value)}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm">
                <option>pending</option><option>filed</option><option>audited</option>
              </select>
            </div>
          </div>
          <div className="flex justify-end gap-3 mt-5">
            <button onClick={() => setModal(null)} className="px-4 py-2 text-sm text-slate-600 hover:underline">Cancel</button>
            <button onClick={save} disabled={saving}
              className="bg-blue-600 text-white px-5 py-2 rounded-lg text-sm hover:bg-blue-700 disabled:opacity-60">
              {saving ? 'Saving…' : 'Save'}
            </button>
          </div>
        </Modal>
      )}
    </PageLayout>
  )
}
