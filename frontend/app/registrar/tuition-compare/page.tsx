'use client'
import { useEffect, useState } from 'react'
import { api } from '@/lib/api'
import type { TuitionComparison } from '@/types'
import PageLayout from '@/components/PageLayout'
import DataTable from '@/components/DataTable'

function fmt(n: number) { return `$${Number(n).toLocaleString('en-US', { minimumFractionDigits: 2 })}` }

export default function TuitionComparePage() {
  const [rows,             setRows]             = useState<TuitionComparison[]>([])
  const [totalFixedCredits, setTotalFixedCredits] = useState(0)
  const [error,            setError]            = useState<string | null>(null)
  const [loading,          setLoading]          = useState(true)
  const [semFilter,        setSemFilter]        = useState('')
  const [yearFilter,       setYearFilter]       = useState('')

  useEffect(() => {
    api.get<{ rows: TuitionComparison[]; total_fixed_credits: number }>('/registrar/tuition-comparison')
      .then(data => { setRows(data.rows); setTotalFixedCredits(data.total_fixed_credits) })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  const semesters = [...new Set(rows.map(r => r.semester_name))].sort()
  const years     = [...new Set(rows.map(r => r.year))].sort((a, b) => b - a)

  const filtered = rows.filter(r =>
    (!semFilter  || r.semester_name === semFilter) &&
    (!yearFilter || String(r.year)  === yearFilter)
  )

  const totalGross    = filtered.reduce((s, r) => s + Number(r.gross_tuition),    0)
  const totalDiscount = filtered.reduce((s, r) => s + Number(r.percent_discount), 0)
  const totalExpected = filtered.reduce((s, r) => s + Number(r.expected_revenue), 0)
  const totalCollected  = filtered.reduce((s, r) => s + Number(r.actual_revenue),   0)
  const totalOutstanding = filtered.reduce((s, r) => s + Number(r.outstanding),    0)

  const cols = [
    { header: 'Semester',        key: 'semester_name',  render: (r: TuitionComparison) => `${r.semester_name} ${r.year}` },
    { header: 'Students',        key: 'student_count' },
    { header: 'Gross Tuition',   key: 'gross_tuition',  render: (r: TuitionComparison) => fmt(r.gross_tuition) },
    { header: '% Discount',      key: 'percent_discount', render: (r: TuitionComparison) => (
      <span className="text-blue-600 font-medium">− {fmt(r.percent_discount)}</span>
    )},
    { header: 'Expected',        key: 'expected_revenue', render: (r: TuitionComparison) => fmt(r.expected_revenue) },
    { header: 'Collected',       key: 'actual_revenue',  render: (r: TuitionComparison) => (
      <span className="text-green-600 font-medium">{fmt(r.actual_revenue)}</span>
    )},
    { header: 'Outstanding',     key: 'outstanding',     render: (r: TuitionComparison) => (
      <span className="text-red-500 font-medium">{fmt(r.outstanding)}</span>
    )},
    { header: 'Collection %',    key: 'actual_revenue',  render: (r: TuitionComparison) => {
      const pct = r.expected_revenue > 0 ? (Number(r.actual_revenue) / Number(r.expected_revenue)) * 100 : 0
      return (
        <div className="flex items-center gap-2">
          <div className="h-2 w-20 bg-slate-100 rounded-full">
            <div className="h-2 bg-green-500 rounded-full" style={{ width: `${Math.min(pct, 100)}%` }} />
          </div>
          <span className="text-xs text-slate-600">{pct.toFixed(1)}%</span>
        </div>
      )
    }},
  ]

  return (
    <PageLayout title="Tuition Revenue Comparison" error={error}>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <select value={semFilter} onChange={e => setSemFilter(e.target.value)}
          className="border border-slate-300 rounded-lg px-3 py-2 text-sm bg-white">
          <option value="">All Semesters</option>
          {semesters.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        <select value={yearFilter} onChange={e => setYearFilter(e.target.value)}
          className="border border-slate-300 rounded-lg px-3 py-2 text-sm bg-white">
          <option value="">All Years</option>
          {years.map(y => <option key={y} value={String(y)}>{y}</option>)}
        </select>
        {(semFilter || yearFilter) && (
          <button onClick={() => { setSemFilter(''); setYearFilter('') }}
            className="text-sm text-slate-500 hover:text-slate-700 underline">
            Clear filters
          </button>
        )}
      </div>

      {/* Revenue waterfall */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">

        {/* Left: scholarship adjustments */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-4">Scholarship Impact</p>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-700">Gross Tuition</span>
              <span className="font-bold text-slate-800">{fmt(totalGross)}</span>
            </div>
            <div className="flex justify-between items-center text-blue-600">
              <span className="text-sm flex items-center gap-1">
                <span className="text-base leading-none">−</span> Percent Scholarships
                <span className="text-xs text-slate-400 ml-1">(applied per semester)</span>
              </span>
              <span className="font-semibold">{fmt(totalDiscount)}</span>
            </div>
            <div className="border-t border-slate-200 pt-2 mt-2 flex justify-between items-center">
              <span className="text-sm font-semibold text-slate-700">Net Billable to Students</span>
              <span className="font-bold text-slate-800 text-lg">{fmt(totalExpected)}</span>
            </div>
            <div className="flex justify-between items-center text-purple-500 pt-2">
              <span className="text-xs flex items-center gap-1">
                Fixed Cash Grants (paid separately, not on invoice)
              </span>
              <span className="text-xs font-semibold">{fmt(totalFixedCredits)}</span>
            </div>
          </div>
        </div>

        {/* Right: collection status */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-4">Collection Status</p>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-700">Amount Billed (after % discount)</span>
              <span className="font-bold text-slate-800">{fmt(totalExpected)}</span>
            </div>
            <div className="flex justify-between items-center text-green-600">
              <span className="text-sm">Collected</span>
              <span className="font-semibold">{fmt(totalCollected)}</span>
            </div>
            <div className="flex justify-between items-center text-red-500">
              <span className="text-sm">Outstanding</span>
              <span className="font-semibold">{fmt(totalOutstanding)}</span>
            </div>
            <div className="border-t border-slate-200 pt-2 mt-2">
              <div className="flex justify-between text-xs text-slate-500 mb-1">
                <span>Collection rate</span>
                <span>{totalExpected > 0 ? ((totalCollected / totalExpected) * 100).toFixed(1) : 0}%</span>
              </div>
              <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-2.5 bg-green-500 rounded-full"
                  style={{ width: `${totalExpected > 0 ? Math.min((totalCollected / totalExpected) * 100, 100) : 0}%` }} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {loading ? <p className="text-slate-500">Loading…</p> : (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
          <DataTable columns={cols} rows={filtered} />
        </div>
      )}
    </PageLayout>
  )
}
