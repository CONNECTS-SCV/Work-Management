'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function Home() {
  const router = useRouter()

  useEffect(() => {
    // 바로 대시보드로 리다이렉트
    router.push('/dashboard')
  }, [router])

  return (
    <div className="min-h-screen bg-Background flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 bg-Primary rounded-2xl flex items-center justify-center mx-auto mb-4 animate-pulse">
          <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
          </svg>
        </div>
        <p className="text-waterloo font-medium">로딩중...</p>
      </div>
    </div>
  )
}
