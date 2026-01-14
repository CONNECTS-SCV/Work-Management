'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Plus, Sparkles, CheckCircle2, Clock, AlertCircle, Circle } from 'lucide-react'
import { workManagementApi } from '@/lib/api'
import type { WorkStatus, WorkPriority, WorkCategory } from '@/lib/types'
import { parseWorkWithOpenAI } from '@/lib/openai'

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
      // Parse work items using OpenAI
      const workItems = await parseWorkWithOpenAI(claudeText)

      // Create work entries for each parsed item
      const createdEntries = await Promise.all(
        workItems.map(item =>
          workManagementApi.workEntries.create({
            team_name: TEAM_NAME,
            username: USERNAME,
            title: item.title,
            description: item.description,
            raw_input: claudeText,
            status: (item.status || 'not_started') as WorkStatus,
            category: (item.category || 'development') as WorkCategory,
            priority: (item.priority || 'medium') as WorkPriority,
            tags: item.tags || [],
            estimated_hours: item.estimated_hours,
          })
        )
      )

      setMessage(`✅ ${createdEntries.length}개 업무가 자동 등록되었습니다!`)
      setClaudeText('')
      setTimeout(() => setMessage(''), 3000)
    } catch (error: any) {
      console.error('Failed to parse with OpenAI:', error)
      setMessage(`❌ 파싱 실패: ${error.message || 'OpenAI API 키를 확인해주세요'}`)
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
            AI 업무 파싱
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
                <h2 className="text-2xl font-bold text-black mb-2">AI 업무 파싱</h2>
                <p className="text-waterloo leading-relaxed">
                  Claude에게 아래 프롬프트를 입력하여 업무 정리를 요청하세요.
                  <br />
                  받은 응답을 붙여넣으면 자동으로 업무로 등록됩니다.
                </p>
              </div>
            </div>

            {/* Prompt Template */}
            <div className="mb-6 p-5 bg-Primary/5 rounded-lg border border-Primary/20">
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm font-bold text-Primary">📋 Claude에게 보낼 프롬프트</p>
                <button
                  type="button"
                  onClick={() => {
                    const promptText = `오늘 한 업무를 다음 형식으로 정리해주세요:

제목: [업무 제목]
설명: [상세 내용]
카테고리: [development/research/meeting/review/documentation/testing/deployment/planning/other 중 선택]
우선순위: [low/medium/high/urgent 중 선택]
상태: [not_started/in_progress/completed/blocked 중 선택]
태그: [관련 태그들, 쉼표로 구분]
예상 시간: [숫자 또는 없으면 생략]

---

여러 업무가 있다면 위 형식을 반복해서 나열해주세요.`
                    navigator.clipboard.writeText(promptText)
                    setMessage('✅ 프롬프트가 클립보드에 복사되었습니다')
                    setTimeout(() => setMessage(''), 2000)
                  }}
                  className="px-4 py-2 bg-Primary text-white text-xs font-semibold rounded-lg hover:bg-Primary-hover transition-all"
                >
                  복사하기
                </button>
              </div>
              <pre className="text-xs text-waterloo whitespace-pre-wrap font-mono bg-white p-4 rounded border border-stroke">
{`오늘 한 업무를 다음 형식으로 정리해주세요:

제목: [업무 제목]
설명: [상세 내용]
카테고리: [development/research/meeting/review/
          documentation/testing/deployment/planning/other 중 선택]
우선순위: [low/medium/high/urgent 중 선택]
상태: [not_started/in_progress/completed/blocked 중 선택]
태그: [관련 태그들, 쉼표로 구분]
예상 시간: [숫자 또는 없으면 생략]

---

여러 업무가 있다면 위 형식을 반복해서 나열해주세요.`}
              </pre>
            </div>

            <form onSubmit={handleClaudeSubmit} className="space-y-6">
              {/* Conversation Text */}
              <div>
                <label className="block text-sm font-semibold text-black mb-2">
                  Claude 응답 붙여넣기
                </label>
                <textarea
                  value={claudeText}
                  onChange={(e) => setClaudeText(e.target.value)}
                  rows={12}
                  className="w-full px-4 py-3 rounded-lg border border-stroke focus:border-Primary focus:ring-2 focus:ring-Primary/20 outline-none transition-all resize-none font-mono text-sm"
                  placeholder="Claude가 정리한 업무 목록을 여기에 붙여넣으세요..."
                  required
                />
              </div>

              {/* Example Box */}
              <div className="p-4 bg-Secondary/20 rounded-lg border border-Secondary/30">
                <p className="text-sm text-waterloo mb-2 font-semibold">💡 사용 방법:</p>
                <ul className="text-sm text-waterloo space-y-1">
                  <li>1. 위의 "복사하기" 버튼으로 프롬프트 복사</li>
                  <li>2. Claude Code에 프롬프트 붙여넣기 및 업무 설명</li>
                  <li>3. Claude의 응답을 위 입력창에 붙여넣기</li>
                  <li>4. "AI 파싱 & 업무 등록" 버튼 클릭</li>
                </ul>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="w-full px-8 py-4 bg-Primary hover:bg-Primary-hover text-white rounded-lg font-semibold transition-all shadow-solid-5 hover:shadow-solid-10 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? '파싱중...' : 'AI 파싱 & 업무 등록'}
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
