'use client'
import { useEffect, useState } from 'react'
import { api } from '@/lib/api'
import type { SpendingCategory } from '@/types'
import PageLayout from '@/components/PageLayout'

function fmt(n: number) { return `$${Number(n).toLocaleString('en-US', { minimumFractionDigits: 2 })}` }

const COLORS = ['bg-blue-500','bg-purple-500','bg-green-500','bg-orange-500','bg-teal-500']
const YEARS  = Array.from({ length: 6 }, (_, i) => new Date().getFullYear() - i)

export default function SpendingPage() {
  const [rows,    setRows]    = useState<SpendingCategory[]>([])
  const [error,   setError]   = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [year,    setYear]    = useState('')

  function load() {
    setLoading(true)
    const params = new URLSearchParams()
    if (year) params.set('year', year)
    api.get<SpendingCategory[]>(`/finance/spending?${params}`)
      .then(setRows).catch(e => setError(e.message)).finally(() => setLoading(false))
  }

  useEffect(load, [])

  const total = rows.reduce((s, r) => s + Number(r.total), 0)

  return (
    <PageLayout title="Spending Summary" error={error}>
      {/* Year filter */}
      <div className="flex gap-3 items-end mb-6">
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-slate-500 uppercase">Year</label>
          <select value={year} onChange={e => setYear(e.target.value)}
            className="border border-slate-300 rounded-lg px-3 py-2 text-sm">
            <option value="">All Years</option>
            {YEARS.map(y => <option key={y}>{y}</option>)}
          </select>
        </div>
        <button onClick={load}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700">
          Apply
        </button>
      </div>

      {loading ? <p className="text-slate-500">Loading…</p> : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Table */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200">
            <div className="px-5 py-4 border-b border-slate-100">
              <h2 className="font-semibold text-slate-700">By Category</h2>
            </div>
            <table className="min-w-full text-sm">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold text-slate-600">Category</th>
                  <th className="px-4 py-3 text-right font-semibold text-slate-600">Amount</th>
                  <th className="px-4 py-3 text-right font-semibold text-slate-600">% of Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {rows.map((r, i) => (
                  <tr key={r.category} className="hover:bg-slate-50">
                    <td className="px-4 py-3 flex items-center gap-2">
                      <span className={`w-3 h-3 rounded-full inline-block ${COLORS[i % COLORS.length]}`} />
                      {r.category}
                    </td>
                    <td className="px-4 py-3 text-right font-mono">{fmt(r.total)}</td>
                    <td className="px-4 py-3 text-right text-slate-500">
                      {total > 0 ? ((Number(r.total) / total) * 100).toFixed(1) + '%' : '—'}
                    </td>
                  </tr>
                ))}
                <tr className="bg-slate-50 font-semibold">
                  <td className="px-4 py-3">Total</td>
                  <td className="px-4 py-3 text-right font-mono">{fmt(total)}</td>
                  <td className="px-4 py-3 text-right">100%</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Bar chart */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
            <h2 className="font-semibold text-slate-700 mb-4">Visual Breakdown</h2>
            <div className="space-y-4">
              {rows.map((r, i) => {
                const pct = total > 0 ? (Number(r.total) / total) * 100 : 0
                return (
                  <div key={r.category}>
                    <div className="flex justify-between text-sm mb-1">
                      <span>{r.category}</span>
                      <span className="font-semibold">{fmt(r.total)}</span>
                    </div>
                    <div className="h-3 bg-slate-100 rounded-full">
                      <div className={`h-3 rounded-full ${COLORS[i % COLORS.length]}`} style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}
    </PageLayout>
  )
}
