'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { authStore } from '@/lib/auth'

export default function Root() {
  const router = useRouter()
  useEffect(() => {
    const user = authStore.get()
    router.replace(user ? `/${user.role}` : '/login')
  }, [])
  return null
}
