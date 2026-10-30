'use client'
import { useAuth } from '@/hooks/useAuth'
import Sidebar from '@/components/Sidebar'

const NAV = [
  { label: 'Staff Management', href: '/admin/staff' },
  { label: 'Job Postings',     href: '/admin/jobs' },
  { label: 'Student Payroll',  href: '/admin/payroll' },
  { label: 'Staff Payments',   href: '/admin/staff-payments' },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { ready } = useAuth('admin')
  if (!ready) return null
  return (
    <div className="flex min-h-screen">
      <Sidebar role="Admin" accent="bg-purple-700" items={NAV} />
      <main className="flex-1 bg-slate-100 overflow-auto">{children}</main>
    </div>
  )
}
