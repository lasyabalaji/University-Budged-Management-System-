'use client'
import { useEffect, useState } from 'react'
import { api } from '@/lib/api'
import type { BudgetDashboard, SpendingCategory } from '@/types'
import PageLayout from '@/components/PageLayout'

function StatCard({ label, value, sub, color }: { label: string; value: string; sub?: string; color: string }) {
  return (
    <div className={`bg-white rounded-xl p-5 border-l-4 ${color} shadow-sm`}>
      <p className="text-xs text-slate-500 uppercase tracking-wide">{label}</p>
      <p className="text-2xl font-bold text-slate-800 mt-1">{value}</p>
      {sub && <p className="text-xs text-slate-400 mt-1">{sub}</p>}
    </div>
  )
}

function fmt(n: number) { return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n) }

export default function FinanceDashboard() {
  const [rows,          setRows]          = useState<BudgetDashboard[]>([])
  const [spending,      setSpending]      = useState<SpendingCategory[]>([])
  const [totalReceived, setTotalReceived] = useState(0)
  const [error,         setError]         = useState<string | null>(null)
  const [loading,       setLoading]       = useState(true)
  const [year,          setYear]          = useState('')
  const [deptFilter,    setDeptFilter]    = useState('')

  function load() {
    setLoading(true)
    const params = new URLSearchParams()
    if (year) params.set('year', year)
    const qs = params.toString()
    Promise.all([
      api.get<BudgetDashboard[]>(`/finance/budget-dashboard${qs ? '?' + qs : ''}`),
      api.get<SpendingCategory[]>(`/finance/spending${qs ? '?' + qs : ''}`),
      api.get<{ total_received: number }>(`/finance/revenue-total${qs ? '?' + qs : ''}`),
    ])
      .then(([d, s, r]) => { setRows(d); setSpending(s); setTotalReceived(r.total_received) })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false))
  }

  useEffect(load, [])

  const filtered         = deptFilter ? rows.filter(r => r.abr === deptFilter) : rows
  const totalAllocated   = rows.reduce((s, r) => s + Number(r.budget_allocation), 0)
  const totalSpendingSum = spending.reduce((s, r) => s + Number(r.total), 0)

  return (
    <PageLayout title="Budget Dashboard" error={error}>
      {/* Filters */}
      <div className="flex gap-4 items-end mb-6 flex-wrap">
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-slate-500 uppercase">Year</label>
          <select value={year} onChange={e => setYear(e.target.value)}
            className="border border-slate-300 rounded-lg px-3 py-2 text-sm">
            <option value="">All Years</option>
            {Array.from({ length: 6 }, (_, i) => new Date().getFullYear() - i).map(y => <option key={y}>{y}</option>)}
          </select>
        </div>
        <button onClick={load}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700">
          Apply
        </button>
      </div>

      {loading ? <p className="text-slate-500">Loading…</p> : (
        <>
          {/* Summary — university-wide totals across all expense categories */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <StatCard label="Total Allocated"   value={fmt(totalAllocated)}    color="border-blue-500" />
            <StatCard label="Total Received"    value={fmt(totalReceived)}
              sub="tuition fees collected"                                      color="border-teal-500" />
            <StatCard label="Total Spent"       value={fmt(totalSpendingSum)}
              sub="staff payroll · student payroll · utilities · misc · clubs · scholarships · tax" color="border-red-400" />
            <StatCard label="Net Surplus"
              value={fmt(totalAllocated - totalSpendingSum)}
              color={(totalAllocated - totalSpendingSum) >= 0 ? 'border-green-500' : 'border-red-500'} />
          </div>

          {/* Per-department breakdown (staff payroll + club spend) */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between gap-4 flex-wrap">
              <div>
                <h2 className="font-semibold text-slate-700">Department Breakdown</h2>
                <p className="text-xs text-slate-400 mt-0.5">Staff payroll + club spending attributed per department</p>
              </div>
              <select value={deptFilter} onChange={e => setDeptFilter(e.target.value)}
                className="border border-slate-300 rounded-lg px-3 py-1.5 text-sm">
                <option value="">All Departments</option>
                {rows.map(r => <option key={r.abr} value={r.abr}>{r.dept_name}</option>)}
              </select>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="bg-slate-50">
                  <tr>{['Department','Allocated','Spent','Surplus/Deficit','Staff','Students','Courses'].map(h => (
                    <th key={h} className="px-4 py-3 text-left font-semibold text-slate-600 whitespace-nowrap">{h}</th>
                  ))}</tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filtered.map(r => (
                    <tr key={r.abr} className="hover:bg-slate-50">
                      <td className="px-4 py-3 font-medium">{r.dept_name}</td>
                      <td className="px-4 py-3">{fmt(r.budget_allocation)}</td>
                      <td className="px-4 py-3">{fmt(r.total_spent)}</td>
                      <td className={`px-4 py-3 font-semibold ${Number(r.surplus_deficit) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {fmt(r.surplus_deficit)}
                      </td>
                      <td className="px-4 py-3 text-center">{r.staff_count}</td>
                      <td className="px-4 py-3 text-center">{r.student_count}</td>
                      <td className="px-4 py-3 text-center">{r.course_count}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </PageLayout>
  )
}
