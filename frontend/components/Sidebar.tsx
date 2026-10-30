'use client'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { authStore } from '@/lib/auth'

export interface NavItem { label: string; href: string }

interface Props {
  role: string
  accent: string
  items: NavItem[]
}

export default function Sidebar({ role, accent, items }: Props) {
  const pathname = usePathname()
  const router   = useRouter()

  function logout() {
    authStore.clear()
    router.replace('/login')
  }

  return (
    <aside className="flex flex-col w-56 h-screen sticky top-0 bg-slate-800 text-white shrink-0">
      {/* Role header */}
      <div className={`px-4 py-5 ${accent} uppercase tracking-widest text-xs font-bold`}>
        {role}
      </div>

      {/* Nav links */}
      <nav className="flex-1 px-2 py-4 space-y-1">
        {items.map(({ label, href }) => {
          const isRoot = href.split('/').filter(Boolean).length === 1
          const active = pathname === href || (!isRoot && pathname.startsWith(href + '/'))
          return (
            <Link
              key={href}
              href={href}
              className={`block px-3 py-2 rounded text-sm font-medium transition-colors
                ${active
                  ? 'bg-slate-600 text-white'
                  : 'text-slate-300 hover:bg-slate-700 hover:text-white'}`}
            >
              {label}
            </Link>
          )
        })}
      </nav>

      {/* Logout */}
      <button
        onClick={logout}
        className="mx-4 mb-6 py-2 rounded bg-slate-700 hover:bg-red-600 text-sm text-slate-300 hover:text-white transition-colors"
      >
        Logout
      </button>
    </aside>
  )
}
