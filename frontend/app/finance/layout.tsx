'use client'
import { useAuth } from '@/hooks/useAuth'
import Sidebar from '@/components/Sidebar'

const NAV = [
  { label: 'Budget Dashboard', href: '/finance' },
  { label: 'Tuition Revenue',  href: '/finance/tuition' },
  { label: 'Scholarships',     href: '/finance/scholarships' },
  { label: 'Spending Summary', href: '/finance/spending' },
  { label: 'Tax Filings',      href: '/finance/tax' },
  { label: 'Utility Bills',    href: '/finance/utility' },
  { label: 'Misc Payments',    href: '/finance/misc' },
]

export default function FinanceLayout({ children }: { children: React.ReactNode }) {
  const { ready } = useAuth('finance')
  if (!ready) return null
  return (
    <div className="flex min-h-screen">
      <Sidebar role="Finance" accent="bg-blue-700" items={NAV} />
      <main className="flex-1 bg-slate-100 overflow-auto">{children}</main>
    </div>
  )
}
