'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Plus, Sparkles, CheckCircle2, Clock, AlertCircle, Circle } from 'lucide-react'
import { workManagementApi } from '@/lib/api'
import type { WorkStatus, WorkPriority, WorkCategory } from '@/lib/types'

export default function WorkPage() {
  const [activeTab, setActiveTab] = useState<'quick' | 'claude'>('quick')
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [status, setStatus] = useState('in_progress')
  const [claudeText, setClaudeText] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)

  const TEAM_NAME = 'curieus'
  const USERNAME = '차성욱'

  const handleQuickSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      await workManagementApi.workEntries.create({
        team_name: TEAM_NAME,
        username: USERNAME,
        title,
        description,
        raw_input: `${title}\n${description}`,
        status: status as WorkStatus,
        category: 'development' as WorkCategory,
        priority: 'medium' as WorkPriority,
        tags: [],
      })

      setMessage('✅ 업무가 등록되었습니다!')
      setTitle('')
      setDescription('')
      setTimeout(() => setMessage(''), 3000)
    } catch (error: any) {
      console.error('Failed to create work entry:', error)
      setMessage(`❌ 등록 실패: ${error.message || '서버 연결을 확인해주세요'}`)
    } finally {
      setLoading(false)
    }
  }

  const handleClaudeSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const result = await workManagementApi.workEntries.fromClaudeSummary({
        team_name: TEAM_NAME,
        username: USERNAME,
        summary: claudeText,
      })

      setMessage(`✅ ${result.length}개 업무가 자동 등록되었습니다!`)
      setClaudeText('')
      setTimeout(() => setMessage(''), 3000)
    } catch (error: any) {
      console.error('Failed to parse Claude text:', error)
      setMessage(`❌ 파싱 실패: ${error.message || '서버 연결을 확인해주세요'}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-Background">
      {/* Header */}
      <header className="bg-white border-b border-stroke sticky top-0 z-50">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/dashboard" className="flex items-center space-x-3 text-waterloo hover:text-Primary transition-colors">
              <ArrowLeft className="w-5 h-5" />
              <span className="font-medium">대시보드로</span>
            </Link>
            <h1 className="text-xl font-bold text-black">업무 기록</h1>
            <div className="w-24"></div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-4 lg:px-8 py-8 max-w-4xl">
        {/* Success Message */}
        {message && (
          <div className={`mb-6 p-4 rounded-lg font-medium animate-slideDown ${
            message.includes('✅')
              ? 'bg-meta/10 border border-meta text-meta'
              : 'bg-red-50 border border-red-500 text-red-600'
          }`}>
            {message}
          </div>
        )}

        {/* Tab Navigation */}
        <div className="card p-2 mb-6 flex space-x-2">
          <button
            onClick={() => setActiveTab('quick')}
            className={`flex-1 px-6 py-3 rounded-lg font-medium transition-all ${
              activeTab === 'quick'
                ? 'bg-Primary text-white shadow-solid-5'
                : 'text-waterloo hover:text-Primary hover:bg-Secondary/20'
            }`}
          >
            <Plus className="w-5 h-5 inline-block mr-2" />
            빠른 기록
          </button>
          <button
            onClick={() => setActiveTab('claude')}
            className={`flex-1 px-6 py-3 rounded-lg font-medium transition-all ${
              activeTab === 'claude'
                ? 'bg-Primary text-white shadow-solid-5'
                : 'text-waterloo hover:text-Primary hover:bg-Secondary/20'
            }`}
          >
            <Sparkles className="w-5 h-5 inline-block mr-2" />
            Claude 자동 파싱
          </button>
        </div>

        {/* Quick Entry Form */}
        {activeTab === 'quick' && (
          <div className="card p-8 animate-fadeIn">
            <h2 className="text-2xl font-bold text-black mb-6">빠른 업무 기록</h2>
            <form onSubmit={handleQuickSubmit} className="space-y-6">
              {/* Title */}
              <div>
                <label className="block text-sm font-semibold text-black mb-2">
                  업무 제목 *
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border border-stroke focus:border-Primary focus:ring-2 focus:ring-Primary/20 outline-none transition-all"
                  placeholder="예: 대시보드 UI 개선"
                  required
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-semibold text-black mb-2">
                  상세 설명 (선택)
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                  className="w-full px-4 py-3 rounded-lg border border-stroke focus:border-Primary focus:ring-2 focus:ring-Primary/20 outline-none transition-all resize-none"
                  placeholder="업무 내용을 자유롭게 작성하세요"
                />
              </div>

              {/* Status */}
              <div>
                <label className="block text-sm font-semibold text-black mb-3">
                  상태
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <StatusButton
                    status="todo"
                    label="할 일"
                    icon={<Circle className="w-4 h-4" />}
                    isActive={status === 'todo'}
                    onClick={() => setStatus('todo')}
                  />
                  <StatusButton
                    status="in_progress"
                    label="진행중"
                    icon={<Clock className="w-4 h-4" />}
                    isActive={status === 'in_progress'}
                    onClick={() => setStatus('in_progress')}
                  />
                  <StatusButton
                    status="completed"
                    label="완료"
                    icon={<CheckCircle2 className="w-4 h-4" />}
                    isActive={status === 'completed'}
                    onClick={() => setStatus('completed')}
                  />
                  <StatusButton
                    status="blocked"
                    label="막힘"
                    icon={<AlertCircle className="w-4 h-4" />}
                    isActive={status === 'blocked'}
                    onClick={() => setStatus('blocked')}
                  />
                </div>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="w-full px-8 py-4 bg-Primary hover:bg-Primary-hover text-white rounded-lg font-semibold transition-all shadow-solid-5 hover:shadow-solid-10 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? '등록중...' : '업무 등록하기'}
              </button>
            </form>
          </div>
        )}

        {/* Claude Parse Form */}
        {activeTab === 'claude' && (
          <div className="card p-8 animate-fadeIn">
            <div className="flex items-start space-x-3 mb-6">
              <Sparkles className="w-6 h-6 text-Primary flex-shrink-0 mt-1" />
              <div>
                <h2 className="text-2xl font-bold text-black mb-2">Claude Code 자동 파싱</h2>
                <p className="text-waterloo leading-relaxed">
                  Claude Code와 작업한 내용을 붙여넣으면 자동으로 업무로 정리됩니다.
                  <br />
                  각 줄이 하나의 업무로 변환되고, 상태와 태그가 자동으로 감지됩니다.
                </p>
              </div>
            </div>

            <form onSubmit={handleClaudeSubmit} className="space-y-6">
              {/* Conversation Text */}
              <div>
                <label className="block text-sm font-semibold text-black mb-2">
                  Claude Code 대화 내용
                </label>
                <textarea
                  value={claudeText}
                  onChange={(e) => setClaudeText(e.target.value)}
                  rows={12}
                  className="w-full px-4 py-3 rounded-lg border border-stroke focus:border-Primary focus:ring-2 focus:ring-Primary/20 outline-none transition-all resize-none font-mono text-sm"
                  placeholder="예시:
- 대시보드 UI 완료
- Tailwind CSS 설정 수정
- API 통신 로직 진행중
- 인증 문제로 막힘"
                  required
                />
              </div>

              {/* Example Box */}
              <div className="p-4 bg-Secondary/20 rounded-lg border border-Secondary/30">
                <p className="text-sm text-waterloo mb-2 font-semibold">💡 자동 감지 예시:</p>
                <ul className="text-sm text-waterloo space-y-1">
                  <li>• "완료", "구현" → ✅ 완료 상태</li>
                  <li>• "진행중", "작업중" → 🔄 진행중 상태</li>
                  <li>• "막힘", "문제" → 🚫 막힘 상태</li>
                  <li>• "API", "백엔드" → 🏷️ backend 태그</li>
                  <li>• "UI", "프론트" → 🏷️ frontend 태그</li>
                </ul>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="w-full px-8 py-4 bg-Primary hover:bg-Primary-hover text-white rounded-lg font-semibold transition-all shadow-solid-5 hover:shadow-solid-10 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? '파싱중...' : '자동 파싱 & 업무 등록'}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  )
}

function StatusButton({
  status,
  label,
  icon,
  isActive,
  onClick
}: {
  status: string
  label: string
  icon: React.ReactNode
  isActive: boolean
  onClick: () => void
}) {
  const colors = {
    todo: 'border-manatee text-manatee hover:bg-manatee/10',
    in_progress: 'border-mainblue text-mainblue hover:bg-mainblue/10',
    completed: 'border-meta text-meta hover:bg-meta/10',
    blocked: 'border-red-500 text-red-500 hover:bg-red-50'
  }

  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-4 py-3 rounded-lg border-2 font-medium transition-all ${
        isActive
          ? 'bg-Primary border-Primary text-white shadow-solid-5'
          : colors[status as keyof typeof colors]
      }`}
    >
      <span className="flex items-center justify-center space-x-2">
        {icon}
        <span>{label}</span>
      </span>
    </button>
  )
}
