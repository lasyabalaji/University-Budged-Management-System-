'use client'
import { useEffect, useState } from 'react'
import { api } from '@/lib/api'
import type { Course } from '@/types'
import PageLayout from '@/components/PageLayout'
import DataTable from '@/components/DataTable'
import Modal from '@/components/Modal'

interface Dept { abr: string; dept_name: string }

const blankForm = () => ({ abr: '', course_id: '', course_name: '', credit_hours: 3 })

export default function CoursesPage() {
  const [rows,     setRows]     = useState<Course[]>([])
  const [depts,    setDepts]    = useState<Dept[]>([])
  const [error,    setError]    = useState<string | null>(null)
  const [success,  setSuccess]  = useState<string | null>(null)
  const [loading,  setLoading]  = useState(true)
  const [modal,    setModal]    = useState<'create' | 'edit' | null>(null)
  const [deleteError, setDeleteError] = useState<string | null>(null)
  const [form,     setForm]     = useState(blankForm())
  const [editCode, setEditCode] = useState('')
  const [saving,   setSaving]   = useState(false)

  function load() {
    Promise.all([
      api.get<Course[]>('/registrar/courses'),
      api.get<Dept[]>('/registrar/departments'),
    ])
      .then(([c, d]) => { setRows(c); setDepts(d) })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false))
  }
  useEffect(load, [])

  function field(k: string, v: unknown) { setForm(f => ({ ...f, [k]: v })) }

  const courseCode = form.abr && form.course_id ? `${form.abr}${form.course_id}` : ''

  async function save() {
    setSaving(true); setError(null)
    try {
      if (modal === 'create') {
        if (!form.abr || !form.course_id || !form.course_name) {
          setError('Department, course number, and name are required')
          setSaving(false); return
        }
        const params = new URLSearchParams({
          abr: form.abr,
          course_id: String(form.course_id),
          course_name: form.course_name,
          course_code: courseCode,
          credit_hours: String(form.credit_hours),
        })
        await api.post(`/registrar/courses?${params}`, null)
        setSuccess('Course created')
      } else {
        const params = new URLSearchParams({
          course_name: form.course_name,
          credit_hours: String(form.credit_hours),
        })
        await api.put(`/registrar/courses/${editCode}?${params}`, null)
        setSuccess('Course updated')
      }
      setModal(null); load()
    } catch (e: unknown) { setError(e instanceof Error ? e.message : 'Error') }
    finally { setSaving(false) }
  }

  async function del(course_code: string) {
    if (!confirm('Delete this course?')) return
    try {
      await api.delete(`/registrar/courses/${course_code}`)
      setSuccess('Course deleted'); load()
    } catch (e: unknown) {
      setDeleteError(e instanceof Error ? e.message : 'This course could not be deleted.')
    }
  }

  const cols = [
    { header: 'Code',    key: 'course_code' },
    { header: 'Name',    key: 'course_name' },
    { header: 'Dept',    key: 'dept_name' },
    { header: 'Credits', key: 'credit_hours' },
    { header: 'Actions', key: 'course_code', render: (r: Course) => (
      <div className="flex gap-2">
        <button
          onClick={() => {
            setForm({ abr: r.abr, course_id: String(r.course_id), course_name: r.course_name, credit_hours: r.credit_hours })
            setEditCode(r.course_code)
            setModal('edit')
          }}
          className="text-orange-600 hover:underline text-xs"
        >Edit</button>
        <button onClick={() => del(r.course_code)} className="text-red-500 hover:underline text-xs">Delete</button>
      </div>
    )},
  ]

  return (
    <PageLayout title="Course Management" error={error} success={success}
      action={
        <button onClick={() => { setForm(blankForm()); setModal('create') }}
          className="bg-orange-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-orange-700">
          + New Course
        </button>
      }>
      {loading ? <p className="text-slate-500">Loading…</p> : (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
          <DataTable columns={cols} rows={rows} />
        </div>
      )}

      {deleteError && (
        <Modal title="Cannot Delete Course" onClose={() => setDeleteError(null)}>
          <div className="flex items-start gap-3">
            <div className="mt-0.5 flex-shrink-0 w-8 h-8 rounded-full bg-red-100 flex items-center justify-center">
              <span className="text-red-600 font-bold text-sm">!</span>
            </div>
            <p className="text-sm text-slate-700 leading-relaxed">{deleteError}</p>
          </div>
          <div className="flex justify-end mt-5">
            <button onClick={() => setDeleteError(null)}
              className="bg-slate-800 text-white px-5 py-2 rounded-lg text-sm hover:bg-slate-700">
              OK
            </button>
          </div>
        </Modal>
      )}

      {modal && (
        <Modal title={modal === 'create' ? 'New Course' : 'Edit Course'} onClose={() => setModal(null)}>
          <div className="space-y-3">

            {/* Department — dropdown on create, read-only on edit */}
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Department</label>
              {modal === 'create' ? (
                <select value={form.abr} onChange={e => field('abr', e.target.value)}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm">
                  <option value="">— select department —</option>
                  {depts.map(d => (
                    <option key={d.abr} value={d.abr}>{d.dept_name}</option>
                  ))}
                </select>
              ) : (
                <input disabled
                  value={depts.find(d => d.abr === form.abr)?.dept_name ?? form.abr}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm bg-slate-50 text-slate-500" />
              )}
            </div>

            {/* Course number — only shown on create */}
            {modal === 'create' && (
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Course Number (e.g. 101, 301)</label>
                <input type="number" value={form.course_id}
                  onChange={e => field('course_id', e.target.value)}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm" />
              </div>
            )}

            {/* Auto-generated course code preview */}
            {modal === 'create' && courseCode && (
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Course Code (auto-generated)</label>
                <input disabled value={courseCode}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm bg-slate-50 text-slate-500" />
              </div>
            )}

            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Course Name</label>
              <input type="text" value={form.course_name}
                onChange={e => field('course_name', e.target.value)}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm" />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Credit Hours</label>
              <input type="number" value={form.credit_hours}
                onChange={e => field('credit_hours', Number(e.target.value))}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm" />
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-5">
            <button onClick={() => setModal(null)} className="px-4 py-2 text-sm text-slate-600 hover:underline">Cancel</button>
            <button onClick={save} disabled={saving}
              className="bg-orange-600 text-white px-5 py-2 rounded-lg text-sm hover:bg-orange-700 disabled:opacity-60">
              {saving ? 'Saving…' : 'Save'}
            </button>
          </div>
        </Modal>
      )}
    </PageLayout>
  )
}
