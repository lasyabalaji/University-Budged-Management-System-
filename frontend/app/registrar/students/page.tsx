'use client'
import { useEffect, useState } from 'react'
import { api } from '@/lib/api'
import type { Student } from '@/types'
import PageLayout from '@/components/PageLayout'
import DataTable from '@/components/DataTable'
import StatusBadge from '@/components/StatusBadge'
import Modal from '@/components/Modal'

const blank = { program_id: '', first_name: '', last_name: '', email: '', enrollment_year: new Date().getFullYear(), status: 'active' }

export default function StudentsPage() {
  const [rows,    setRows]    = useState<Student[]>([])
  const [error,   setError]   = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [search,  setSearch]  = useState('')
  const [modal,   setModal]   = useState<'create' | 'edit' | null>(null)
  const [form,    setForm]    = useState<Record<string, unknown>>(blank)
  const [saving,  setSaving]  = useState(false)

  function load() {
    const params = search ? `?search=${encodeURIComponent(search)}` : ''
    api.get<Student[]>(`/registrar/students${params}`)
      .then(setRows).catch(e => setError(e.message)).finally(() => setLoading(false))
  }
  useEffect(load, [])

  function field(k: string, v: unknown) { setForm(f => ({ ...f, [k]: v })) }

  async function save() {
    setSaving(true); setError(null)
    const F = form as Record<string, unknown>
    const body = { ...F, program_id: Number(F.program_id), enrollment_year: Number(F.enrollment_year) }
    try {
      if (modal === 'create') {
        await api.post('/registrar/students', body); setSuccess('Student registered')
      } else {
        await api.put(`/registrar/students/${(form as unknown as Student).student_id}`, body); setSuccess('Student updated')
      }
      setModal(null); load()
    } catch (e: unknown) { setError(e instanceof Error ? e.message : 'Error') }
    finally { setSaving(false) }
  }

  const F = form as Record<string, unknown>
  const cols = [
    { header: 'ID',      key: 'student_id' },
    { header: 'Name',    key: 'first_name', render: (r: Student) => `${r.first_name} ${r.last_name}` },
    { header: 'Email',   key: 'email' },
    { header: 'Program', key: 'program_name' },
    { header: 'Level',   key: 'degree_level' },
    { header: 'Year',    key: 'enrollment_year' },
    { header: 'Status',  key: 'status', render: (r: Student) => <StatusBadge value={r.status} /> },
    { header: 'Actions', key: 'student_id', render: (r: Student) => (
      <button onClick={() => { setForm(r as unknown as Record<string, unknown>); setModal('edit') }} className="text-orange-600 hover:underline text-xs">Edit</button>
    )},
  ]

  return (
    <PageLayout title="Student Records" error={error} success={success}
      action={
        <div className="flex gap-2">
          <input value={search} onChange={e => setSearch(e.target.value)} onKeyDown={e => e.key === 'Enter' && load()}
            placeholder="Search…" className="border border-slate-300 rounded-lg px-3 py-2 text-sm" />
          <button onClick={load} className="bg-slate-200 px-3 py-2 rounded-lg text-sm hover:bg-slate-300">Search</button>
          <button onClick={() => { setForm(blank); setModal('create') }}
            className="bg-orange-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-orange-700">+ Register Student</button>
        </div>
      }>
      {loading ? <p className="text-slate-500">Loading…</p> : (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
          <DataTable columns={cols} rows={rows} />
        </div>
      )}
      {modal && (
        <Modal title={modal === 'create' ? 'Register Student' : 'Edit Student'} onClose={() => setModal(null)}>
          <div className="space-y-3">
            {[['First Name','first_name','text'],['Last Name','last_name','text'],['Email','email','email'],['Program ID','program_id','number'],['Enrollment Year','enrollment_year','number']].map(([label, key, type]) => (
              <div key={key}>
                <label className="block text-xs font-medium text-slate-600 mb-1">{label}</label>
                <input type={type} value={String(F[key] ?? '')} onChange={e => field(key, e.target.value)}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm" />
              </div>
            ))}
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Status</label>
              <select value={String(F.status)} onChange={e => field('status', e.target.value)}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm">
                <option>active</option><option>alumni</option><option>suspended</option>
              </select>
            </div>
          </div>
          <div className="flex justify-end gap-3 mt-5">
            <button onClick={() => setModal(null)} className="px-4 py-2 text-sm text-slate-600 hover:underline">Cancel</button>
            <button onClick={save} disabled={saving} className="bg-orange-600 text-white px-5 py-2 rounded-lg text-sm hover:bg-orange-700 disabled:opacity-60">
              {saving ? 'Saving…' : 'Save'}
            </button>
          </div>
        </Modal>
      )}
    </PageLayout>
  )
}
