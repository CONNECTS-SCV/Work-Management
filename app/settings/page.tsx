'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ArrowLeft, Key, Save, Eye, EyeOff } from 'lucide-react'
import { getOpenAIKey, setOpenAIKey, removeOpenAIKey } from '@/lib/openai'

export default function SettingsPage() {
  const [apiKey, setApiKeyState] = useState('')
  const [showApiKey, setShowApiKey] = useState(false)
  const [message, setMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    const savedKey = getOpenAIKey()
    if (savedKey) {
      setApiKeyState(savedKey)
    }
  }, [])

  const handleSave = () => {
    setIsLoading(true)
    try {
      if (apiKey.trim()) {
        setOpenAIKey(apiKey.trim())
        setMessage('✅ API 키가 저장되었습니다')
      } else {
        removeOpenAIKey()
        setMessage('✅ API 키가 삭제되었습니다')
      }
      setTimeout(() => setMessage(''), 3000)
    } catch (error) {
      setMessage('❌ 저장 실패')
    } finally {
      setIsLoading(false)
    }
  }

  const handleClear = () => {
    setApiKeyState('')
    removeOpenAIKey()
    setMessage('✅ API 키가 삭제되었습니다')
    setTimeout(() => setMessage(''), 3000)
  }

  return (
    <div className="min-h-screen bg-Background">
      {/* Header */}
      <header className="bg-white border-b border-stroke sticky top-0 z-50 backdrop-blur-sm bg-white/95">
        <div className="container mx-auto px-6 lg:px-12">
          <div className="flex items-center justify-between h-20">
            <div className="flex items-center space-x-4">
              <Link
                href="/dashboard"
                className="flex items-center space-x-2 text-waterloo hover:text-Primary transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                <span className="font-medium">돌아가기</span>
              </Link>
              <div className="h-6 w-px bg-stroke"></div>
              <h1 className="text-2xl font-bold text-black">설정</h1>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 lg:px-12 py-8">
        <div className="max-w-2xl mx-auto">
          {/* API Key Section */}
          <div className="bg-white rounded-2xl border border-stroke p-8 shadow-solid-2">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-12 h-12 bg-Primary/10 rounded-xl flex items-center justify-center">
                <Key className="w-6 h-6 text-Primary" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-black">OpenAI API 키</h2>
                <p className="text-sm text-waterloo">AI 업무 파싱 기능에 사용됩니다</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-black mb-2">
                  API Key
                </label>
                <div className="relative">
                  <input
                    type={showApiKey ? 'text' : 'password'}
                    value={apiKey}
                    onChange={(e) => setApiKeyState(e.target.value)}
                    placeholder="sk-..."
                    className="w-full px-4 py-3 bg-Background border border-stroke rounded-lg focus:outline-none focus:border-Primary focus:ring-2 focus:ring-Primary-tab transition-all duration-200 pr-12"
                  />
                  <button
                    type="button"
                    onClick={() => setShowApiKey(!showApiKey)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-waterloo hover:text-Primary transition-colors"
                  >
                    {showApiKey ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                <p className="text-xs text-waterloo mt-2">
                  API 키는 브라우저의 로컬 스토리지에만 저장되며 서버로 전송되지 않습니다.
                </p>
              </div>

              <div className="flex items-center space-x-3">
                <button
                  onClick={handleSave}
                  disabled={isLoading}
                  className="flex items-center space-x-2 px-6 py-3 bg-Primary hover:bg-Primary-hover text-white font-semibold rounded-lg transition-all duration-200 shadow-solid-5 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Save className="w-5 h-5" />
                  <span>저장</span>
                </button>
                <button
                  onClick={handleClear}
                  className="px-6 py-3 bg-Background hover:bg-stroke text-waterloo hover:text-black font-semibold rounded-lg transition-all duration-200"
                >
                  초기화
                </button>
              </div>

              {message && (
                <div className={`p-4 rounded-lg ${message.includes('✅') ? 'bg-meta/10 text-meta' : 'bg-red-50 text-red-600'}`}>
                  <p className="font-medium">{message}</p>
                </div>
              )}
            </div>
          </div>

          {/* Info Section */}
          <div className="mt-6 p-6 bg-Primary/5 rounded-xl border border-Primary/20">
            <h3 className="font-bold text-black mb-2">OpenAI API 키 발급 방법</h3>
            <ol className="text-sm text-waterloo space-y-1 list-decimal list-inside">
              <li>
                <a
                  href="https://platform.openai.com/api-keys"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-Primary hover:underline"
                >
                  OpenAI Platform
                </a>
                에 접속합니다
              </li>
              <li>로그인 후 "Create new secret key" 버튼을 클릭합니다</li>
              <li>생성된 API 키를 복사하여 위 입력란에 붙여넣습니다</li>
              <li>저장 버튼을 클릭하여 설정을 완료합니다</li>
            </ol>
          </div>
        </div>
      </main>
    </div>
  )
}
