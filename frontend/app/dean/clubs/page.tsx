'use client'
import { useEffect, useState } from 'react'
import { api } from '@/lib/api'
import type { Club } from '@/types'
import PageLayout from '@/components/PageLayout'
import DataTable from '@/components/DataTable'
import StatusBadge from '@/components/StatusBadge'
import Modal from '@/components/Modal'

const blank = { staff_id: '', club_name: '', club_category: '', funding_source: '', academic_year: '2024-25' }

export default function ClubsPage() {
  const [rows,    setRows]    = useState<Club[]>([])
  const [error,   setError]   = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [createModal, setCreateModal] = useState(false)
  const [approveModal, setApproveModal] = useState<Club | null>(null)
  const [form,    setForm]    = useState<Record<string, unknown>>(blank)
  const [amount,  setAmount]  = useState('')
  const [saving,  setSaving]  = useState(false)

  function load() {
    api.get<Club[]>('/dean/clubs').then(setRows).catch(e => setError(e.message)).finally(() => setLoading(false))
  }
  useEffect(load, [])

  function field(k: string, v: unknown) { setForm(f => ({ ...f, [k]: v })) }

  async function createClub() {
    setSaving(true); setError(null)
    const F = form as Record<string, unknown>
    try {
      await api.post('/dean/clubs', { ...F, staff_id: F.staff_id ? Number(F.staff_id) : null })
      setSuccess('Club request submitted'); setCreateModal(false); load()
    } catch (e: unknown) { setError(e instanceof Error ? e.message : 'Error') }
    finally { setSaving(false) }
  }

  async function decide(club_id: number, action: 'approve' | 'reject') {
    setError(null)
    try {
      const body = action === 'approve' ? { action, amount: Number(amount) } : { action }
      await api.put(`/dean/clubs/${club_id}`, body)
      setSuccess(`Club funding ${action}d`); setApproveModal(null); load()
    } catch (e: unknown) { setError(e instanceof Error ? e.message : 'Error') }
  }

  async function del(club_id: number) {
    if (!confirm('Delete this club?')) return
    try { await api.delete(`/dean/clubs/${club_id}`); setSuccess('Club deleted'); load() }
    catch (e: unknown) { setError(e instanceof Error ? e.message : 'Error') }
  }

  const F = form as Record<string, unknown>
  const cols = [
    { header: 'Club Name',  key: 'club_name' },
    { header: 'Category',   key: 'club_category' },
    { header: 'Advisor',    key: 'staff_name', render: (r: Club) => r.staff_name ?? '—' },
    { header: 'Dept',       key: 'dept_name',  render: (r: Club) => r.dept_name  ?? '—' },
    { header: 'Allocated',  key: 'allocated_amount', render: (r: Club) => `$${Number(r.allocated_amount).toLocaleString()}` },
    { header: 'Spent',      key: 'spent_amount',     render: (r: Club) => `$${Number(r.spent_amount).toLocaleString()}` },
    { header: 'Year',       key: 'academic_year' },
    { header: 'Status',     key: 'approval_status',  render: (r: Club) => <StatusBadge value={r.approval_status} /> },
    { header: 'Actions',    key: 'club_id', render: (r: Club) => (
      <div className="flex gap-2">
        {r.approval_status === 'pending' && (
          <button onClick={() => { setApproveModal(r); setAmount('') }}
            className="bg-green-100 text-green-700 hover:bg-green-200 px-2 py-1 rounded text-xs font-medium">Review</button>
        )}
        <button onClick={() => del(r.club_id)} className="text-red-500 hover:underline text-xs">Delete</button>
      </div>
    )},
  ]

  return (
    <PageLayout title="Club Funding" error={error} success={success}
      action={<button onClick={() => { setForm(blank); setCreateModal(true) }}
        className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-green-700">+ New Club Request</button>}>
      {loading ? <p className="text-slate-500">Loading…</p> : (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
          <DataTable columns={cols} rows={rows} />
        </div>
      )}

      {createModal && (
        <Modal title="New Club Funding Request" onClose={() => setCreateModal(false)}>
          <div className="space-y-3">
            {[['Club Name','club_name','text'],['Category','club_category','text'],['Funding Source','funding_source','text'],['Academic Year','academic_year','text'],['Staff Advisor ID (optional)','staff_id','number']].map(([label, key, type]) => (
              <div key={key}>
                <label className="block text-xs font-medium text-slate-600 mb-1">{label}</label>
                <input type={type} value={String(F[key] ?? '')} onChange={e => field(key, e.target.value)}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm" />
              </div>
            ))}
          </div>
          <div className="flex justify-end gap-3 mt-5">
            <button onClick={() => setCreateModal(false)} className="px-4 py-2 text-sm text-slate-600 hover:underline">Cancel</button>
            <button onClick={createClub} disabled={saving} className="bg-green-600 text-white px-5 py-2 rounded-lg text-sm hover:bg-green-700 disabled:opacity-60">
              {saving ? 'Submitting…' : 'Submit'}
            </button>
          </div>
        </Modal>
      )}

      {approveModal && (
        <Modal title={`Review: ${approveModal.club_name}`} onClose={() => setApproveModal(null)}>
          <p className="text-sm text-slate-600 mb-4">Enter amount to approve, or reject the request.</p>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Allocated Amount ($)</label>
            <input type="number" value={amount} onChange={e => setAmount(e.target.value)}
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm" />
          </div>
          <div className="flex justify-end gap-3 mt-5">
            <button onClick={() => decide(approveModal.club_id, 'reject')}
              className="bg-red-100 text-red-700 hover:bg-red-200 px-4 py-2 rounded-lg text-sm font-medium">Reject</button>
            <button onClick={() => decide(approveModal.club_id, 'approve')}
              className="bg-green-600 text-white px-5 py-2 rounded-lg text-sm hover:bg-green-700">Approve</button>
          </div>
        </Modal>
      )}
    </PageLayout>
  )
}
