'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { authStore, type AuthUser } from '@/lib/auth'

export function useAuth(requiredRole?: string) {
  const router = useRouter()
  const [user, setUser] = useState<AuthUser | null>(null)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const stored = authStore.get()
    if (!stored) { router.replace('/login'); return }
    if (requiredRole && stored.role !== requiredRole) { router.replace('/login'); return }
    setUser(stored)
    setReady(true)
  }, [])

  return { user, ready }
}
