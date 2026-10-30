'use client'
import { useAuth } from '@/hooks/useAuth'
import Sidebar from '@/components/Sidebar'

const NAV = [
  { label: 'Course Registration', href: '/student/courses' },
  { label: 'My Tuition',          href: '/student/tuition' },
  { label: 'My Payroll',          href: '/student/payroll' },
  { label: 'My Scholarships',     href: '/student/scholarships' },
]

export default function StudentLayout({ children }: { children: React.ReactNode }) {
  const { ready } = useAuth('student')
  if (!ready) return null
  return (
    <div className="flex min-h-screen">
      <Sidebar role="Student Portal" accent="bg-teal-700" items={NAV} />
      <main className="flex-1 bg-slate-100 overflow-auto">{children}</main>
    </div>
  )
}
