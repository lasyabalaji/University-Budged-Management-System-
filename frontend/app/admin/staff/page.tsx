'use client'
import { useEffect, useState } from 'react'
import { api } from '@/lib/api'
import type { Staff } from '@/types'
import PageLayout from '@/components/PageLayout'
import DataTable from '@/components/DataTable'
import StatusBadge from '@/components/StatusBadge'
import Modal from '@/components/Modal'

const blankStaff = { dept_id: '', first_name: '', last_name: '', role: '', salary: '', hire_date: '', email: '', staff_type: 'faculty', reports_to: '', academic_rank: 'Lecturer', category: '' }

export default function StaffPage() {
  const [rows,    setRows]    = useState<Staff[]>([])
  const [error,   setError]   = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [search,  setSearch]  = useState('')
  const [modal,   setModal]   = useState<'create' | 'edit' | null>(null)
  const [form,    setForm]    = useState<Record<string, unknown>>(blankStaff)
  const [saving,  setSaving]  = useState(false)

  function load() {
    const params = search ? `?search=${encodeURIComponent(search)}` : ''
    api.get<Staff[]>(`/admin/staff${params}`)
      .then(setRows).catch(e => setError(e.message)).finally(() => setLoading(false))
  }
  useEffect(load, [])

  function field(k: string, v: unknown) { setForm(f => ({ ...f, [k]: v })) }

  async function save() {
    setSaving(true); setError(null)
    const F = form as Record<string, unknown>
    const body = { ...F, salary: Number(F.salary), dept_id: F.dept_id ? Number(F.dept_id) : null, reports_to: F.reports_to ? Number(F.reports_to) : null }
    try {
      if (modal === 'create') {
        await api.post('/admin/staff', body)
        setSuccess('Staff member created')
      } else {
        await api.put(`/admin/staff/${(form as unknown as Staff).staff_id}`, body)
        setSuccess('Staff member updated')
      }
      setModal(null); load()
    } catch (e: unknown) { setError(e instanceof Error ? e.message : 'Error') }
    finally { setSaving(false) }
  }

  async function deactivate(staff_id: number) {
    if (!confirm('Deactivate this staff member?')) return
    try {
      await api.delete(`/admin/staff/${staff_id}`)
      setSuccess('Staff member deactivated'); load()
    } catch (e: unknown) { setError(e instanceof Error ? e.message : 'Error') }
  }

  const F = form as Record<string, unknown>
  const cols = [
    { header: 'Name',       key: 'first_name', render: (r: Staff) => `${r.first_name} ${r.last_name}` },
    { header: 'Email',      key: 'email' },
    { header: 'Role',       key: 'role' },
    { header: 'Type',       key: 'staff_type', render: (r: Staff) => <StatusBadge value={r.staff_type} /> },
    { header: 'Dept',       key: 'dept_name',  render: (r: Staff) => r.dept_name ?? '—' },
    { header: 'Salary',     key: 'salary',     render: (r: Staff) => `$${Number(r.salary).toLocaleString()}` },
    { header: 'Status',     key: 'status',     render: (r: Staff) => <StatusBadge value={r.status} /> },
    { header: 'Rank/Cat',   key: 'academic_rank', render: (r: Staff) => r.academic_rank ?? r.category ?? '—' },
    { header: 'Actions',    key: 'staff_id',   render: (r: Staff) => (
      <div className="flex gap-2">
        <button onClick={() => { setForm(r as unknown as Record<string, unknown>); setModal('edit') }} className="text-purple-600 hover:underline text-xs">Edit</button>
        {r.status === 'active' && (
          <button onClick={() => deactivate(r.staff_id)} className="text-red-500 hover:underline text-xs">Deactivate</button>
        )}
      </div>
    )},
  ]

  return (
    <PageLayout title="Staff Management" error={error} success={success}
      action={
        <div className="flex gap-2">
          <input value={search} onChange={e => setSearch(e.target.value)} onKeyDown={e => e.key === 'Enter' && load()}
            placeholder="Search name / email…" className="border border-slate-300 rounded-lg px-3 py-2 text-sm" />
          <button onClick={load} className="bg-slate-200 px-3 py-2 rounded-lg text-sm hover:bg-slate-300">Search</button>
          <button onClick={() => { setForm(blankStaff); setModal('create') }}
            className="bg-purple-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-purple-700">+ Add Staff</button>
        </div>
      }>
      {loading ? <p className="text-slate-500">Loading…</p> : (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
          <DataTable columns={cols} rows={rows} />
        </div>
      )}

      {modal && (
        <Modal title={modal === 'create' ? 'Add Staff Member' : 'Edit Staff Member'} onClose={() => setModal(null)} wide>
          <div className="grid grid-cols-2 gap-4">
            {[['First Name','first_name','text'],['Last Name','last_name','text'],['Email','email','email'],['Role','role','text'],['Salary','salary','number'],['Hire Date','hire_date','date'],['Dept ID','dept_id','number'],['Reports To (ID)','reports_to','number']].map(([label, key, type]) => (
              <div key={key}>
                <label className="block text-xs font-medium text-slate-600 mb-1">{label}</label>
                <input type={type} value={String(F[key] ?? '')}
                  onChange={e => field(key, e.target.value)}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm" />
              </div>
            ))}
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Staff Type</label>
              <select value={String(F.staff_type)} onChange={e => field('staff_type', e.target.value)}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm">
                <option value="faculty">Faculty</option>
                <option value="support_staff">Support Staff</option>
              </select>
            </div>
            {F.staff_type === 'faculty' ? (
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Academic Rank</label>
                <select value={String(F.academic_rank)} onChange={e => field('academic_rank', e.target.value)}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm">
                  {['Lecturer','Adjunct','Assistant Professor','Associate Professor','Professor'].map(r => <option key={r}>{r}</option>)}
                </select>
              </div>
            ) : (
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Category</label>
                <input type="text" value={String(F.category ?? '')} onChange={e => field('category', e.target.value)}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm" />
              </div>
            )}
          </div>
          <div className="flex justify-end gap-3 mt-5">
            <button onClick={() => setModal(null)} className="px-4 py-2 text-sm text-slate-600 hover:underline">Cancel</button>
            <button onClick={save} disabled={saving}
              className="bg-purple-600 text-white px-5 py-2 rounded-lg text-sm hover:bg-purple-700 disabled:opacity-60">
              {saving ? 'Saving…' : 'Save'}
            </button>
          </div>
        </Modal>
      )}
    </PageLayout>
  )
}
