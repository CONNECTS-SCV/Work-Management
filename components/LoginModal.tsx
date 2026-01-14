'use client'

import { useState } from 'react'
import { User, X } from 'lucide-react'
import { authService } from '@/lib/auth'

interface LoginModalProps {
  onLogin: (username: string) => void
}

export default function LoginModal({ onLogin }: LoginModalProps) {
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!username.trim()) {
      alert('이름을 입력해주세요')
      return
    }

    authService.setCurrentUser({
      username: username.trim(),
      email: email.trim() || undefined
    })

    onLogin(username.trim())
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-solid-10 max-w-md w-full p-8 relative">
        {/* 헤더 */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-Primary rounded-full flex items-center justify-center mx-auto mb-4 shadow-solid-5">
            <User className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-black mb-2">환영합니다!</h2>
          <p className="text-waterloo">업무 관리를 시작하려면 이름을 입력해주세요</p>
        </div>

        {/* 폼 */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="username" className="block text-sm font-semibold text-black mb-2">
              이름 <span className="text-red-500">*</span>
            </label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="홍길동"
              className="w-full px-4 py-3 rounded-xl border-2 border-stroke outline-none focus:border-Primary transition-colors font-medium"
              autoFocus
              required
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-semibold text-black mb-2">
              이메일 (선택)
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="example@curieus.net"
              className="w-full px-4 py-3 rounded-xl border-2 border-stroke outline-none focus:border-Primary transition-colors font-medium"
            />
          </div>

          <button
            type="submit"
            className="w-full px-6 py-4 bg-Primary hover:bg-Primary-hover text-white rounded-xl font-bold transition-all shadow-solid-5 hover:shadow-solid-10 text-lg"
          >
            시작하기
          </button>
        </form>

        {/* 안내 */}
        <p className="text-center text-sm text-manatee mt-6">
          입력한 정보는 브라우저에만 저장됩니다
        </p>
      </div>
    </div>
  )
}
