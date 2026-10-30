'use client'
import { useAuth } from '@/hooks/useAuth'
import Sidebar from '@/components/Sidebar'

const NAV = [
  { label: 'Departments',        href: '/dean/departments' },
  { label: 'Scholarships',       href: '/dean/scholarships' },
  { label: 'Applications',       href: '/dean/applications' },
  { label: 'Club Funding',       href: '/dean/clubs' },
  { label: 'Program Rates',      href: '/dean/programs' },
]

export default function DeanLayout({ children }: { children: React.ReactNode }) {
  const { ready } = useAuth('dean')
  if (!ready) return null
  return (
    <div className="flex min-h-screen">
      <Sidebar role="Dean's Office" accent="bg-green-700" items={NAV} />
      <main className="flex-1 bg-slate-100 overflow-auto">{children}</main>
    </div>
  )
}
