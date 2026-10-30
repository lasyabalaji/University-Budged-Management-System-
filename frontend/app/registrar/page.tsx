'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
export default function RegistrarIndex() {
  const router = useRouter()
  useEffect(() => router.replace('/registrar/courses'), [])
  return null
}
