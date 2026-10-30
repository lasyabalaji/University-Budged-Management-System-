'use client'
import { useEffect, useState } from 'react'
import { api } from '@/lib/api'
import type { Scholarship } from '@/types'
import PageLayout from '@/components/PageLayout'
import DataTable from '@/components/DataTable'
import Modal from '@/components/Modal'

const blank = {
  scholarship_name: '', scholarship_type: 'percent' as 'percent' | 'fixed',
  percent_coverage: 50, fixed_amount: 0, total_amount: 0, eligibility_criteria: '',
}

function fmt(n: number) { return `$${Number(n).toLocaleString()}` }

export default function ScholarshipsPage() {
  const [rows,    setRows]    = useState<Scholarship[]>([])
  const [error,   setError]   = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [modal,   setModal]   = useState(false)
  const [form,    setForm]    = useState({ ...blank })
  const [saving,  setSaving]  = useState(false)

  function load() {
    api.get<Scholarship[]>('/dean/scholarships')
      .then(setRows).catch(e => setError(e.message)).finally(() => setLoading(false))
  }
  useEffect(load, [])

  function field(k: string, v: unknown) { setForm(f => ({ ...f, [k]: v })) }

  async function save() {
    setSaving(true); setError(null)
    try {
      await api.post('/dean/scholarships', {
        ...form,
        percent_coverage: Number(form.percent_coverage),
        fixed_amount:     Number(form.fixed_amount),
        total_amount:     Number(form.total_amount),
      })
      setSuccess('Scholarship created'); setModal(false); load()
    } catch (e: unknown) { setError(e instanceof Error ? e.message : 'Error') }
    finally { setSaving(false) }
  }

  async function del(id: number) {
    if (!confirm('Delete this scholarship?')) return
    try { await api.delete(`/dean/scholarships/${id}`); setSuccess('Scholarship deleted'); load() }
    catch (e: unknown) { setError(e instanceof Error ? e.message : 'Error') }
  }

  const cols = [
    { header: 'Name',   key: 'scholarship_name' },
    { header: 'Type',   key: 'scholarship_type', render: (r: Scholarship) => (
      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
        r.scholarship_type === 'percent' ? 'bg-blue-100 text-blue-700' : 'bg-amber-100 text-amber-700'
      }`}>
        {r.scholarship_type === 'percent' ? `${r.percent_coverage}% / semester` : `Fixed ${fmt(r.fixed_amount)}`}
      </span>
    )},
    { header: 'Pool',      key: 'original_amount',   render: (r: Scholarship) => fmt(r.original_amount) },
    { header: 'Remaining', key: 'remaining_balance', render: (r: Scholarship) => (
      r.scholarship_type === 'fixed'
        ? <span className={Number(r.remaining_balance) < Number(r.original_amount) ? 'text-amber-600 font-medium' : ''}>
            {fmt(r.remaining_balance)}
          </span>
        : <span className="text-slate-400 text-xs">N/A — per semester</span>
    )},
    { header: 'Applications',key: 'total_applications' },
    { header: 'Approved',    key: 'approved_count' },
    { header: 'Actions',     key: 'scholarship_id', render: (r: Scholarship) => (
      <button onClick={() => del(r.scholarship_id)} className="text-red-500 hover:underline text-xs">Delete</button>
    )},
  ]

  return (
    <PageLayout title="Scholarships" error={error} success={success}
      action={
        <button onClick={() => { setForm({ ...blank }); setModal(true) }}
          className="bg-green-700 text-white px-4 py-2 rounded-lg text-sm hover:bg-green-800">
          + New Scholarship
        </button>
      }>
      {loading ? <p className="text-slate-500">Loading…</p> : (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
          <DataTable columns={cols} rows={rows} />
        </div>
      )}

      {modal && (
        <Modal title="Create Scholarship" onClose={() => setModal(false)}>
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Scholarship Name</label>
              <input type="text" value={form.scholarship_name}
                onChange={e => field('scholarship_name', e.target.value)}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm" />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Scholarship Type</label>
              <select value={form.scholarship_type}
                onChange={e => field('scholarship_type', e.target.value as 'percent' | 'fixed')}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm">
                <option value="percent">Percent — applied every semester</option>
                <option value="fixed">Fixed Amount — deducted once</option>
              </select>
            </div>

            {form.scholarship_type === 'percent' ? (
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Coverage % (per semester)</label>
                <input type="number" min={1} max={100} value={form.percent_coverage}
                  onChange={e => field('percent_coverage', Number(e.target.value))}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm" />
              </div>
            ) : (
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Fixed Award Amount ($)</label>
                <input type="number" min={0} value={form.fixed_amount}
                  onChange={e => field('fixed_amount', Number(e.target.value))}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm" />
              </div>
            )}

            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Total Pool ($)</label>
              <input type="number" min={0} value={form.total_amount}
                onChange={e => field('total_amount', Number(e.target.value))}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm" />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Eligibility Criteria</label>
              <textarea value={form.eligibility_criteria}
                onChange={e => field('eligibility_criteria', e.target.value)}
                rows={3} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm" />
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-5">
            <button onClick={() => setModal(false)} className="px-4 py-2 text-sm text-slate-600 hover:underline">Cancel</button>
            <button onClick={save} disabled={saving}
              className="bg-green-700 text-white px-5 py-2 rounded-lg text-sm hover:bg-green-800 disabled:opacity-60">
              {saving ? 'Saving…' : 'Create'}
            </button>
          </div>
        </Modal>
      )}
    </PageLayout>
  )
}
