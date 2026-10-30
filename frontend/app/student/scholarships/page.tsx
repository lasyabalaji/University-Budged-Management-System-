'use client'
import { useEffect, useState } from 'react'
import { api } from '@/lib/api'
import { authStore } from '@/lib/auth'
import type { StudentScholarship, Scholarship } from '@/types'
import PageLayout from '@/components/PageLayout'
import DataTable from '@/components/DataTable'
import StatusBadge from '@/components/StatusBadge'
import Modal from '@/components/Modal'

export default function StudentScholarshipsPage() {
  const user = authStore.get()
  const studentId = user?.student_id

  const [myAwards,     setMyAwards]     = useState<StudentScholarship[]>([])
  const [allScholarships, setAllScholarships] = useState<Scholarship[]>([])
  const [error,        setError]        = useState<string | null>(null)
  const [success,      setSuccess]      = useState<string | null>(null)
  const [loading,      setLoading]      = useState(true)
  const [modal,        setModal]        = useState(false)
  const [selectedId,   setSelectedId]   = useState('')
  const [saving,       setSaving]       = useState(false)

  function load() {
    if (!studentId) return
    Promise.all([
      api.get<StudentScholarship[]>(`/student/${studentId}/scholarships`),
      api.get<Scholarship[]>('/dean/scholarships'),
    ])
      .then(([a, s]) => { setMyAwards(a); setAllScholarships(s) })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false))
  }
  useEffect(load, [])

  async function apply() {
    if (!selectedId || !studentId) return
    setSaving(true); setError(null)
    try {
      await api.post(`/student/${studentId}/scholarships/apply`, { student_id: studentId, scholarship_id: Number(selectedId) })
      setSuccess('Application submitted! The Dean\'s Office will review it.'); setModal(false); load()
    } catch (e: unknown) { setError(e instanceof Error ? e.message : 'Error') }
    finally { setSaving(false) }
  }

  const appliedIds = new Set(myAwards.map(a => a.scholarship_id))
  const available  = allScholarships.filter(s => {
    if (appliedIds.has(s.scholarship_id)) return false
    if (s.scholarship_type === 'fixed') return Number(s.remaining_balance) >= Number(s.fixed_amount)
    return Number(s.total_amount) > 0
  })

  const cols = [
    { header: 'Scholarship',    key: 'scholarship_name' },
    { header: 'Coverage', key: 'scholarship_type', render: (r: StudentScholarship) =>
        r.scholarship_type === 'percent'
          ? `${r.percent_coverage}% / semester`
          : `Fixed $${Number(r.fixed_amount).toLocaleString()}`
    },
    { header: 'Awarded', key: 'percent_discount', render: (r: StudentScholarship) =>
        r.percent_discount != null
          ? <span className="text-blue-700 font-medium">{r.percent_discount}% / semester</span>
          : r.fixed_award != null
            ? <span className="text-amber-700 font-medium">${Number(r.fixed_award).toLocaleString()}</span>
            : '—'
    },
    { header: 'Award Date',     key: 'award_date',       render: (r: StudentScholarship) => r.award_date ?? '—' },
    { header: 'Status',         key: 'status',           render: (r: StudentScholarship) => <StatusBadge value={r.status} /> },
  ]

  return (
    <PageLayout title="My Scholarships" error={error} success={success}
      action={
        available.length > 0 ? (
          <button onClick={() => setModal(true)}
            className="bg-teal-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-teal-700">Apply for Scholarship</button>
        ) : undefined
      }>
      {loading ? <p className="text-slate-500">Loading…</p> : (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
          <DataTable columns={cols} rows={myAwards} empty="No scholarship applications yet." />
        </div>
      )}

      {modal && (
        <Modal title="Apply for Scholarship" onClose={() => setModal(false)}>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Select Scholarship</label>
            <select value={selectedId} onChange={e => setSelectedId(e.target.value)}
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm">
              <option value="">— choose —</option>
              {available.map(s => (
                <option key={s.scholarship_id} value={s.scholarship_id}>
                  {s.scholarship_name} —{' '}
                  {s.scholarship_type === 'percent'
                    ? `${s.percent_coverage}% off every semester`
                    : `$${Number(s.fixed_amount).toLocaleString()} fixed award ($${Number(s.remaining_balance).toLocaleString()} pool left)`}
                </option>
              ))}
            </select>
          </div>
          <div className="flex justify-end gap-3 mt-5">
            <button onClick={() => setModal(false)} className="px-4 py-2 text-sm text-slate-600 hover:underline">Cancel</button>
            <button onClick={apply} disabled={saving || !selectedId}
              className="bg-teal-600 text-white px-5 py-2 rounded-lg text-sm hover:bg-teal-700 disabled:opacity-60">
              {saving ? 'Submitting…' : 'Submit Application'}
            </button>
          </div>
        </Modal>
      )}
    </PageLayout>
  )
}
