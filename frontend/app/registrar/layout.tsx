'use client'
import { useAuth } from '@/hooks/useAuth'
import Sidebar from '@/components/Sidebar'

const NAV = [
  { label: 'Courses',            href: '/registrar/courses' },
  { label: 'Students',           href: '/registrar/students' },
  { label: 'Tuition Comparison', href: '/registrar/tuition-compare' },
]

export default function RegistrarLayout({ children }: { children: React.ReactNode }) {
  const { ready } = useAuth('registrar')
  if (!ready) return null
  return (
    <div className="flex min-h-screen">
      <Sidebar role="Registrar" accent="bg-orange-600" items={NAV} />
      <main className="flex-1 bg-slate-100 overflow-auto">{children}</main>
    </div>
  )
}
