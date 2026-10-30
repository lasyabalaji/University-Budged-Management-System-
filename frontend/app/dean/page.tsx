'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
export default function DeanIndex() {
  const router = useRouter()
  useEffect(() => router.replace('/dean/scholarships'), [])
  return null
}
