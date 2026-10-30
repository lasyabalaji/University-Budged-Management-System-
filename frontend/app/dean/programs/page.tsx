'use client'
import { useEffect, useState } from 'react'
import { api } from '@/lib/api'
import type { Program } from '@/types'
import PageLayout from '@/components/PageLayout'
import DataTable from '@/components/DataTable'
import Modal from '@/components/Modal'

export default function ProgramsPage() {
  const [rows,    setRows]    = useState<Program[]>([])
  const [error,   setError]   = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [modal,   setModal]   = useState<Program | null>(null)
  const [newRate, setNewRate] = useState('')
  const [saving,  setSaving]  = useState(false)

  function load() {
    api.get<Program[]>('/dean/programs').then(setRows).catch(e => setError(e.message)).finally(() => setLoading(false))
  }
  useEffect(load, [])

  async function save() {
    if (!modal) return
    setSaving(true); setError(null)
    try {
      await api.put(`/dean/programs/${modal.program_id}/cost-per-credit`, { cost_per_credit: Number(newRate) })
      setSuccess('Cost per credit updated'); setModal(null); load()
    } catch (e: unknown) { setError(e instanceof Error ? e.message : 'Error') }
    finally { setSaving(false) }
  }

  const cols = [
    { header: 'Program',     key: 'program_name' },
    { header: 'Level',       key: 'degree_level' },
    { header: 'Dept',        key: 'dept_name' },
    { header: 'Duration',    key: 'duration_years', render: (r: Program) => `${r.duration_years} yr` },
    { header: 'Cost/Credit', key: 'cost_per_credit', render: (r: Program) => `$${Number(r.cost_per_credit).toFixed(2)}` },
    { header: 'Students',    key: 'enrolled_students' },
    { header: 'Actions',     key: 'program_id', render: (r: Program) => (
      <button onClick={() => { setModal(r); setNewRate(String(r.cost_per_credit)) }}
        className="text-green-600 hover:underline text-xs">Edit Rate</button>
    )},
  ]

  return (
    <PageLayout title="Program Rates" error={error} success={success}>
      {loading ? <p className="text-slate-500">Loading…</p> : (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
          <DataTable columns={cols} rows={rows} />
        </div>
      )}
      {modal && (
        <Modal title={`Update Rate — ${modal.program_name}`} onClose={() => setModal(null)}>
          <p className="text-sm text-slate-500 mb-4">
            Current: <strong>${Number(modal.cost_per_credit).toFixed(2)}</strong> per credit
          </p>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">New Cost Per Credit ($)</label>
            <input type="number" value={newRate} onChange={e => setNewRate(e.target.value)}
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm" />
          </div>
          <div className="flex justify-end gap-3 mt-5">
            <button onClick={() => setModal(null)} className="px-4 py-2 text-sm text-slate-600 hover:underline">Cancel</button>
            <button onClick={save} disabled={saving} className="bg-green-600 text-white px-5 py-2 rounded-lg text-sm hover:bg-green-700 disabled:opacity-60">
              {saving ? 'Saving…' : 'Update'}
            </button>
          </div>
        </Modal>
      )}
    </PageLayout>
  )
}
