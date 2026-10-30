const COLORS: Record<string, string> = {
  active:    'bg-green-100 text-green-700',
  paid:      'bg-green-100 text-green-700',
  approved:  'bg-green-100 text-green-700',
  filed:     'bg-green-100 text-green-700',
  open:      'bg-green-100 text-green-700',
  inactive:  'bg-slate-100 text-slate-600',
  alumni:    'bg-slate-100 text-slate-600',
  closed:    'bg-slate-100 text-slate-600',
  pending:   'bg-yellow-100 text-yellow-700',
  unpaid:    'bg-yellow-100 text-yellow-700',
  overdue:   'bg-red-100 text-red-700',
  rejected:  'bg-red-100 text-red-700',
  suspended: 'bg-red-100 text-red-700',
  failed:    'bg-red-100 text-red-700',
  filled:    'bg-blue-100 text-blue-700',
  audited:   'bg-purple-100 text-purple-700',
  waived:    'bg-purple-100 text-purple-700',
}

export default function StatusBadge({ value }: { value: string }) {
  const cls = COLORS[value?.toLowerCase()] ?? 'bg-slate-100 text-slate-600'
  return (
    <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold capitalize ${cls}`}>
      {value}
    </span>
  )
}
