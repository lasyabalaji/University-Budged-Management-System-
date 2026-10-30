'use client'
import { useState } from 'react'
import { api } from '@/lib/api'
import { authStore } from '@/lib/auth'
import PageLayout from '@/components/PageLayout'

interface AvailableCourse {
  course_code:        string
  abr:                string
  course_id:          number
  course_name:        string
  credit_hours:       number
  dept_name:          string
  already_registered: number
}

export default function CourseRegistrationPage() {
  const studentId = authStore.get()?.student_id

  const [semester,  setSemester]  = useState('Fall')
  const [year,      setYear]      = useState(String(new Date().getFullYear()))
  const [courses,   setCourses]   = useState<AvailableCourse[]>([])
  const [selected,  setSelected]  = useState<string[]>([])
  const [loaded,    setLoaded]    = useState(false)
  const [loading,   setLoading]   = useState(false)
  const [saving,    setSaving]    = useState(false)
  const [error,     setError]     = useState<string | null>(null)
  const [success,   setSuccess]   = useState<string | null>(null)

  async function loadCourses() {
    if (!studentId) return
    setLoading(true); setError(null); setLoaded(false); setSelected([])
    try {
      const params = new URLSearchParams({ semester_name: semester, year })
      const data = await api.get<AvailableCourse[]>(`/student/${studentId}/available-courses?${params}`)
      setCourses(data)
      setLoaded(true)
    } catch (e: unknown) { setError(e instanceof Error ? e.message : 'Failed to load courses') }
    finally { setLoading(false) }
  }

  function toggle(code: string) {
    setSelected(prev => prev.includes(code) ? prev.filter(x => x !== code) : [...prev, code])
  }

  async function register() {
    if (!studentId || selected.length === 0) return
    setSaving(true); setError(null)
    try {
      const res = await api.post<{ message: string; courses_added: number }>(
        `/student/${studentId}/register-courses`,
        { semester_name: semester, year: Number(year), course_codes: selected },
      )
      setSuccess(`${res.message} — ${res.courses_added} course(s) added. Tuition updated.`)
      setSelected([])
      const params = new URLSearchParams({ semester_name: semester, year })
      const data = await api.get<AvailableCourse[]>(`/student/${studentId}/available-courses?${params}`)
      setCourses(data)
    } catch (e: unknown) { setError(e instanceof Error ? e.message : 'Registration failed') }
    finally { setSaving(false) }
  }

  const newCourses      = courses.filter(c => !c.already_registered)
  const registeredCount = courses.filter(c => c.already_registered).length
  const totalNewCredits = courses
    .filter(c => selected.includes(c.course_code))
    .reduce((s, c) => s + c.credit_hours, 0)

  return (
    <PageLayout title="Course Registration" error={error} success={success}>

      {/* Semester selector */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm mb-5 max-w-md">
        <h2 className="font-semibold text-slate-700 mb-3">Select Semester</h2>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Semester</label>
            <select value={semester} onChange={e => { setSemester(e.target.value); setLoaded(false) }}
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm">
              <option>Fall</option><option>Spring</option><option>Summer</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Year</label>
            <input type="number" value={year}
              onChange={e => { setYear(e.target.value); setLoaded(false) }}
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm" />
          </div>
        </div>
        <button onClick={loadCourses} disabled={loading}
          className="mt-4 bg-teal-700 hover:bg-teal-800 disabled:opacity-60 text-white px-5 py-2 rounded-lg text-sm font-medium transition-colors">
          {loading ? 'Loading…' : 'Load Courses'}
        </button>
      </div>

      {/* Course list */}
      {loaded && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
          <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h2 className="font-semibold text-slate-700">
                {semester} {year} — Program Courses
              </h2>
              {registeredCount > 0 && (
                <p className="text-xs text-slate-400 mt-0.5">
                  {registeredCount} course{registeredCount !== 1 ? 's' : ''} already registered this semester
                </p>
              )}
            </div>
            {selected.length > 0 && (
              <span className="text-xs text-teal-700 font-medium">
                {selected.length} selected · {totalNewCredits} credits
              </span>
            )}
          </div>

          {courses.length === 0 ? (
            <p className="p-5 text-sm text-slate-500">No courses found for your program.</p>
          ) : (
            <div className="divide-y divide-slate-100">
              {/* Already registered — shown greyed out */}
              {courses.filter(c => c.already_registered).map(c => (
                <div key={c.course_code} className="flex items-center gap-3 px-5 py-3 opacity-50">
                  <input type="checkbox" checked disabled className="accent-teal-600" />
                  <div className="flex-1 text-sm">
                    <span className="font-medium">{c.course_code}</span>
                    <span className="text-slate-500"> — {c.course_name}</span>
                    <span className="ml-2 text-xs text-slate-400">({c.credit_hours} cr · {c.dept_name})</span>
                  </div>
                  <span className="text-xs text-green-600 font-medium">Registered</span>
                </div>
              ))}

              {/* Available to register */}
              {newCourses.length === 0 && registeredCount > 0 ? (
                <p className="px-5 py-4 text-sm text-slate-500">
                  You are registered for all courses this semester.
                </p>
              ) : (
                newCourses.map(c => {
                  const checked = selected.includes(c.course_code)
                  return (
                    <label key={c.course_code}
                      className={`flex items-center gap-3 px-5 py-3 cursor-pointer transition-colors
                        ${checked ? 'bg-teal-50' : 'hover:bg-slate-50'}`}>
                      <input type="checkbox" checked={checked}
                        onChange={() => toggle(c.course_code)}
                        className="accent-teal-600" />
                      <div className="flex-1 text-sm">
                        <span className="font-medium">{c.course_code}</span>
                        <span className="text-slate-600"> — {c.course_name}</span>
                        <span className="ml-2 text-xs text-slate-400">({c.credit_hours} cr · {c.dept_name})</span>
                      </div>
                    </label>
                  )
                })
              )}
            </div>
          )}

          {selected.length > 0 && (
            <div className="px-5 py-4 border-t border-slate-100 flex items-center justify-between">
              <p className="text-sm text-slate-600">
                Registering <strong>{selected.length}</strong> course(s) · <strong>{totalNewCredits}</strong> total credits
              </p>
              <button onClick={register} disabled={saving}
                className="bg-teal-700 hover:bg-teal-800 disabled:opacity-60 text-white px-6 py-2 rounded-lg text-sm font-medium transition-colors">
                {saving ? 'Registering…' : 'Confirm Registration'}
              </button>
            </div>
          )}
        </div>
      )}
    </PageLayout>
  )
}
