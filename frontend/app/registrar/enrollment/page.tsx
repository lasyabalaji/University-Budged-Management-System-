'use client'
import { useEffect, useState } from 'react'
import { api } from '@/lib/api'
import type { Student } from '@/types'
import PageLayout from '@/components/PageLayout'

export default function EnrollmentPage() {
  const [students,  setStudents]  = useState<Student[]>([])
  const [studentId, setStudentId] = useState('')
  const [semester,  setSemester]  = useState('Fall')
  const [year,      setYear]      = useState(String(new Date().getFullYear()))
  const [error,     setError]     = useState<string | null>(null)
  const [success,   setSuccess]   = useState<string | null>(null)
  const [saving,    setSaving]    = useState(false)

  useEffect(() => {
    api.get<Student[]>('/registrar/students')
      .then(setStudents)
      .catch(e => setError(e.message))
  }, [])

  async function enroll() {
    if (!studentId) { setError('Select a student'); return }
    setSaving(true); setError(null); setSuccess(null)
    try {
      const res = await api.post<{ message: string }>('/registrar/enrollment', {
        student_id: Number(studentId),
        semester_name: semester,
        year: Number(year),
      })
      setSuccess(res.message)
      setStudentId('')
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Enrollment failed')
    } finally {
      setSaving(false)
    }
  }

  const selectedStudent = students.find(s => s.student_id === Number(studentId))

  return (
    <PageLayout title="Enroll Student" error={error} success={success}>
      <div className="max-w-lg space-y-5">

        {/* Student */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
          <h2 className="font-semibold text-slate-700 mb-3">1. Select Student</h2>
          <select
            value={studentId}
            onChange={e => setStudentId(e.target.value)}
            className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm"
          >
            <option value="">— choose student —</option>
            {students.map(s => (
              <option key={s.student_id} value={s.student_id}>
                {s.first_name} {s.last_name} (ID {s.student_id}) — {s.program_name}
              </option>
            ))}
          </select>
          {selectedStudent && (
            <div className="mt-3 text-xs text-slate-500 space-y-1">
              <p>Program: <strong>{selectedStudent.program_name}</strong></p>
              <p>Level: {selectedStudent.degree_level}</p>
            </div>
          )}
        </div>

        {/* Semester */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
          <h2 className="font-semibold text-slate-700 mb-3">2. Select Semester</h2>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Semester</label>
              <select
                value={semester}
                onChange={e => setSemester(e.target.value)}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm"
              >
                <option>Fall</option>
                <option>Spring</option>
                <option>Summer</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Year</label>
              <input
                type="number"
                value={year}
                onChange={e => setYear(e.target.value)}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm"
              />
            </div>
          </div>
        </div>

        {/* Info note */}
        <p className="text-xs text-slate-400 px-1">
          Tuition is calculated from the student's program cost per credit × 15 credit hours
          and will appear on their account immediately.
        </p>

        <button
          onClick={enroll}
          disabled={saving}
          className="bg-orange-600 hover:bg-orange-700 disabled:opacity-60 text-white font-semibold px-8 py-3 rounded-xl text-sm transition-colors"
        >
          {saving ? 'Enrolling…' : 'Enroll Student & Generate Tuition'}
        </button>
      </div>
    </PageLayout>
  )
}
