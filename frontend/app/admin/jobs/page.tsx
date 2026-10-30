'use client'
import { useEffect, useState } from 'react'
import { api } from '@/lib/api'
import type { Job } from '@/types'
import PageLayout from '@/components/PageLayout'
import DataTable from '@/components/DataTable'
import StatusBadge from '@/components/StatusBadge'
import Modal from '@/components/Modal'

const blank = { title: '', positions_available: 1, description: '', hourly_rate: 0, availability_status: 'open' }

export default function JobsPage() {
  const [rows,    setRows]    = useState<Job[]>([])
  const [error,   setError]   = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [modal,   setModal]   = useState<'create' | 'edit' | null>(null)
  const [form,    setForm]    = useState<Record<string, unknown>>(blank)
  const [saving,  setSaving]  = useState(false)

  function load() {
    api.get<Job[]>('/admin/jobs').then(setRows).catch(e => setError(e.message)).finally(() => setLoading(false))
  }
  useEffect(load, [])

  function field(k: string, v: unknown) { setForm(f => ({ ...f, [k]: v })) }

  async function save() {
    setSaving(true); setError(null)
    const F = form as Record<string, unknown>
    const body = { ...F, positions_available: Number(F.positions_available), hourly_rate: Number(F.hourly_rate) }
    try {
      if (modal === 'create') {
        await api.post('/admin/jobs', body); setSuccess('Job created')
      } else {
        await api.put(`/admin/jobs/${(form as unknown as Job).job_id}`, body); setSuccess('Job updated')
      }
      setModal(null); load()
    } catch (e: unknown) { setError(e instanceof Error ? e.message : 'Error') }
    finally { setSaving(false) }
  }

  async function del(job_id: number) {
    if (!confirm('Delete this job posting?')) return
    try { await api.delete(`/admin/jobs/${job_id}`); setSuccess('Job deleted'); load() }
    catch (e: unknown) { setError(e instanceof Error ? e.message : 'Error') }
  }

  const F = form as Record<string, unknown>
  const cols = [
    { header: 'Title',      key: 'title' },
    { header: 'Positions',  key: 'positions_available' },
    { header: 'Hourly Rate',key: 'hourly_rate', render: (r: Job) => `$${Number(r.hourly_rate).toFixed(2)}/hr` },
    { header: 'Status',     key: 'availability_status', render: (r: Job) => <StatusBadge value={r.availability_status} /> },
    { header: 'Actions',    key: 'job_id', render: (r: Job) => (
      <div className="flex gap-2">
        <button onClick={() => { setForm(r as unknown as Record<string, unknown>); setModal('edit') }} className="text-purple-600 hover:underline text-xs">Edit</button>
        <button onClick={() => del(r.job_id)} className="text-red-500 hover:underline text-xs">Delete</button>
      </div>
    )},
  ]

  return (
    <PageLayout title="Job Postings" error={error} success={success}
      action={<button onClick={() => { setForm(blank); setModal('create') }}
        className="bg-purple-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-purple-700">+ New Job</button>}>
      {loading ? <p className="text-slate-500">Loading…</p> : (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
          <DataTable columns={cols} rows={rows} />
        </div>
      )}
      {modal && (
        <Modal title={modal === 'create' ? 'New Job Posting' : 'Edit Job'} onClose={() => setModal(null)}>
          <div className="space-y-3">
            {[['Title','title','text'],['Positions Available','positions_available','number'],['Hourly Rate','hourly_rate','number'],['Description','description','text']].map(([label, key, type]) => (
              <div key={key}>
                <label className="block text-xs font-medium text-slate-600 mb-1">{label}</label>
                <input type={type} value={String(F[key] ?? '')}
                  onChange={e => field(key, type === 'number' ? Number(e.target.value) : e.target.value)}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm" />
              </div>
            ))}
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Status</label>
              <select value={String(F.availability_status)} onChange={e => field('availability_status', e.target.value)}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm">
                <option>open</option><option>closed</option><option>filled</option>
              </select>
            </div>
          </div>
          <div className="flex justify-end gap-3 mt-5">
            <button onClick={() => setModal(null)} className="px-4 py-2 text-sm text-slate-600 hover:underline">Cancel</button>
            <button onClick={save} disabled={saving} className="bg-purple-600 text-white px-5 py-2 rounded-lg text-sm hover:bg-purple-700 disabled:opacity-60">
              {saving ? 'Saving…' : 'Save'}
            </button>
          </div>
        </Modal>
      )}
    </PageLayout>
  )
}
