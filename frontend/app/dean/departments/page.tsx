'use client'
import { useEffect, useState } from 'react'
import { api } from '@/lib/api'
import PageLayout from '@/components/PageLayout'
import DataTable from '@/components/DataTable'
import Modal from '@/components/Modal'

interface Department {
  abr: string
  dept_name: string
  budget_allocation: number
  program_count: number
  staff_count: number
}

function fmt(n: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n)
}

const blankCreate = { abr: '', dept_name: '', budget_allocation: 0 }

export default function DepartmentsPage() {
  const [rows,    setRows]    = useState<Department[]>([])
  const [error,   setError]   = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [modal,   setModal]   = useState<'create' | 'edit' | null>(null)
  const [form,    setForm]    = useState<Record<string, unknown>>(blankCreate)
  const [editAbr, setEditAbr] = useState('')
  const [saving,  setSaving]  = useState(false)

  function load() {
    api.get<Department[]>('/dean/departments')
      .then(setRows).catch(e => setError(e.message)).finally(() => setLoading(false))
  }
  useEffect(load, [])

  function field(k: string, v: unknown) { setForm(f => ({ ...f, [k]: v })) }

  async function save() {
    setSaving(true); setError(null)
    try {
      if (modal === 'create') {
        if (!form.abr || !form.dept_name) {
          setError('Abbreviation and name are required'); setSaving(false); return
        }
        await api.post('/dean/departments', {
          abr: String(form.abr).toUpperCase(),
          dept_name: form.dept_name,
          budget_allocation: Number(form.budget_allocation),
        })
        setSuccess('Department created')
      } else {
        await api.put(`/dean/departments/${editAbr}`, {
          dept_name: form.dept_name,
          budget_allocation: Number(form.budget_allocation),
        })
        setSuccess('Department updated')
      }
      setModal(null); load()
    } catch (e: unknown) { setError(e instanceof Error ? e.message : 'Error') }
    finally { setSaving(false) }
  }

  async function del(abr: string, dept_name: string) {
    if (!confirm(`Delete "${dept_name}"? This will fail if any programs are linked to it.`)) return
    try {
      await api.delete(`/dean/departments/${abr}`)
      setSuccess('Department deleted'); load()
    } catch (e: unknown) { setError(e instanceof Error ? e.message : 'Error') }
  }

  const cols = [
    { header: 'Abbreviation', key: 'abr' },
    { header: 'Department Name', key: 'dept_name' },
    { header: 'Budget Allocation', key: 'budget_allocation', render: (r: Department) => fmt(r.budget_allocation) },
    { header: 'Programs', key: 'program_count', render: (r: Department) => <span className="text-center block">{r.program_count}</span> },
    { header: 'Active Staff', key: 'staff_count', render: (r: Department) => <span className="text-center block">{r.staff_count}</span> },
    { header: 'Actions', key: 'abr', render: (r: Department) => (
      <div className="flex gap-2">
        <button
          onClick={() => {
            setForm({ dept_name: r.dept_name, budget_allocation: r.budget_allocation })
            setEditAbr(r.abr)
            setModal('edit')
          }}
          className="text-green-700 hover:underline text-xs"
        >Edit</button>
        <button onClick={() => del(r.abr, r.dept_name)} className="text-red-500 hover:underline text-xs">Delete</button>
      </div>
    )},
  ]

  return (
    <PageLayout title="Department Management" error={error} success={success}
      action={
        <button onClick={() => { setForm(blankCreate); setModal('create') }}
          className="bg-green-700 text-white px-4 py-2 rounded-lg text-sm hover:bg-green-800">
          + New Department
        </button>
      }>
      {loading ? <p className="text-slate-500">Loading…</p> : (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
          <DataTable columns={cols} rows={rows} />
        </div>
      )}

      {modal && (
        <Modal title={modal === 'create' ? 'New Department' : 'Edit Department'} onClose={() => setModal(null)}>
          <div className="space-y-3">

            {modal === 'create' && (
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Abbreviation (e.g. CS, BUS)</label>
                <input type="text" maxLength={10}
                  value={String(form.abr ?? '').toUpperCase()}
                  onChange={e => field('abr', e.target.value.toUpperCase())}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm uppercase" />
              </div>
            )}

            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Department Name</label>
              <input type="text" value={String(form.dept_name ?? '')}
                onChange={e => field('dept_name', e.target.value)}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm" />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Budget Allocation ($)</label>
              <input type="number" min={0} value={String(form.budget_allocation ?? 0)}
                onChange={e => field('budget_allocation', e.target.value)}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm" />
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-5">
            <button onClick={() => setModal(null)} className="px-4 py-2 text-sm text-slate-600 hover:underline">Cancel</button>
            <button onClick={save} disabled={saving}
              className="bg-green-700 text-white px-5 py-2 rounded-lg text-sm hover:bg-green-800 disabled:opacity-60">
              {saving ? 'Saving…' : 'Save'}
            </button>
          </div>
        </Modal>
      )}
    </PageLayout>
  )
}
