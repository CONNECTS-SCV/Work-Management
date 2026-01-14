'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { TrendingUp, Plus, LogOut, LayoutDashboard, CalendarClock, Columns3, User, Calendar } from 'lucide-react'
import { workManagementApi } from '@/lib/api'
import type { WorkEntry } from '@/lib/types'
import { authService } from '@/lib/auth'
import LoginModal from '@/components/LoginModal'
import WorkDetailModal from '@/components/WorkDetailModal'

export default function TimelinePage() {
  const [workEntries, setWorkEntries] = useState<WorkEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])
  const [error, setError] = useState<string | null>(null)
  const [currentUser, setCurrentUser] = useState<string | null>(null)
  const [showLoginModal, setShowLoginModal] = useState(false)
  const [selectedEntry, setSelectedEntry] = useState<WorkEntry | null>(null)

  const TEAM_NAME = 'curieus'

  // 사용자 인증 체크
  useEffect(() => {
    const user = authService.getCurrentUser()
    if (user) {
      setCurrentUser(user.username)
    } else {
      setShowLoginModal(true)
    }
  }, [])

  const loadData = async () => {
    if (!currentUser) {
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)
      const entries = await workManagementApi.workEntries.getAll(TEAM_NAME, selectedDate)

      // 시간순으로 정렬 (최신순)
      const sortedEntries = entries.sort((a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      )

      setWorkEntries(sortedEntries)
    } catch (err: any) {
      console.error('Failed to load data:', err)
      setError(err.message || '데이터를 불러오는데 실패했습니다')
      setWorkEntries([])
    } finally {
      setLoading(false)
    }
  }

  // currentUser 변경 시 데이터 로드
  useEffect(() => {
    loadData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDate, currentUser])

  const handleLogin = (username: string) => {
    setCurrentUser(username)
    setShowLoginModal(false)
  }

  const handleLogout = () => {
    if (confirm('로그아웃 하시겠습니까?')) {
      authService.logout()
      setCurrentUser(null)
      setShowLoginModal(true)
      setWorkEntries([])
    }
  }

  const handleWorkClick = (entry: WorkEntry) => {
    setSelectedEntry(entry)
  }

  const handleWorkUpdate = async (id: string, data: Partial<WorkEntry>) => {
    try {
      const entry = workEntries.find(e => e.id === id)
      if (!entry) return

      await workManagementApi.workEntries.update(TEAM_NAME, entry.username, id, data)
      loadData()
    } catch (error) {
      console.error('Failed to update work entry:', error)
      alert('업무 업데이트에 실패했습니다')
    }
  }

  const handleWorkDelete = async (id: string) => {
    const entry = workEntries.find(e => e.id === id)
    if (!entry) return

    try {
      await workManagementApi.workEntries.delete(TEAM_NAME, entry.username, id)
      setSelectedEntry(null)
      loadData()
    } catch (error) {
      console.error('Failed to delete work entry:', error)
      alert('업무 삭제에 실패했습니다')
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-meta/10 text-meta border-meta'
      case 'in_progress': return 'bg-mainblue/10 text-mainblue border-mainblue'
      case 'blocked': return 'bg-red-50 text-red-500 border-red-500'
      default: return 'bg-manatee/10 text-manatee border-manatee'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed': return '완료'
      case 'in_progress': return '진행중'
      case 'blocked': return '막힘'
      default: return '할 일'
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-Background flex items-center justify-center">
        <div className="text-center">
          <TrendingUp className="w-12 h-12 text-Primary animate-pulse mx-auto mb-4" />
          <p className="text-waterloo font-medium">로딩중...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-Background">
      {/* Header */}
      <header className="bg-white border-b border-stroke sticky top-0 z-50 backdrop-blur-sm bg-white/95">
        <div className="container mx-auto px-6 lg:px-12">
          <div className="flex items-center justify-between h-20">
            <div className="flex items-center space-x-8">
              <Link href="/dashboard" className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-Primary rounded-xl flex items-center justify-center shadow-solid-5">
                  <TrendingUp className="w-5 h-5 text-white" />
                </div>
                <span className="text-2xl font-bold text-black">Work</span>
              </Link>

              {/* Navigation Menu */}
              <nav className="hidden md:flex items-center space-x-2">
                <Link
                  href="/dashboard"
                  className="px-4 py-2 text-waterloo hover:bg-Background rounded-lg font-semibold transition-all flex items-center space-x-2"
                >
                  <LayoutDashboard className="w-4 h-4" />
                  <span>대시보드</span>
                </Link>
                <Link
                  href="/timeline"
                  className="px-4 py-2 bg-Primary/10 text-Primary rounded-lg font-semibold transition-all flex items-center space-x-2"
                >
                  <CalendarClock className="w-4 h-4" />
                  <span>타임라인</span>
                </Link>
                <Link
                  href="/kanban"
                  className="px-4 py-2 text-waterloo hover:bg-Background rounded-lg font-semibold transition-all flex items-center space-x-2"
                >
                  <Columns3 className="w-4 h-4" />
                  <span>칸반</span>
                </Link>
              </nav>
            </div>

            <div className="flex items-center space-x-3">
              {/* Current User Info */}
              {currentUser && (
                <div className="flex items-center space-x-3 px-4 py-2 bg-Background rounded-xl">
                  <div className="w-8 h-8 bg-Primary rounded-full flex items-center justify-center">
                    <span className="text-sm font-bold text-white">
                      {currentUser.charAt(0)}
                    </span>
                  </div>
                  <span className="font-semibold text-black">{currentUser}</span>
                </div>
              )}

              <Link
                href="/work"
                className="px-6 py-3 bg-Primary hover:bg-Primary-hover text-white rounded-xl font-semibold transition-all shadow-solid-5 hover:shadow-solid-10 inline-flex items-center space-x-2"
              >
                <Plus className="w-4 h-4" />
                <span>업무 기록</span>
              </Link>

              {/* Logout Button */}
              {currentUser && (
                <button
                  onClick={handleLogout}
                  className="p-3 text-waterloo hover:bg-Background hover:text-red-500 rounded-xl transition-all"
                  title="로그아웃"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-6 lg:px-12 py-12">
        {/* Top Bar */}
        <div className="flex items-center justify-between mb-10">
          <div>
            <h1 className="text-4xl font-bold text-black mb-2">타임라인</h1>
            <p className="text-waterloo text-lg">시간순으로 업무를 확인하세요</p>
          </div>
          <div className="flex items-center space-x-3">
            {/* Date Picker */}
            <div className="flex items-center space-x-3 bg-white px-5 py-3 rounded-xl border border-stroke shadow-solid-2">
              <Calendar className="w-5 h-5 text-Primary" />
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="outline-none font-medium text-black cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-8 p-5 bg-red-50 border-2 border-red-200 rounded-xl">
            <p className="text-red-600 font-medium">⚠️ {error}</p>
            <p className="text-sm text-red-500 mt-2">curieus.net 서버와 연결을 확인해주세요.</p>
          </div>
        )}

        {/* Timeline */}
        <div className="max-w-4xl mx-auto">
          {workEntries.length === 0 ? (
            <div className="text-center py-20">
              <div className="w-20 h-20 bg-Background rounded-full flex items-center justify-center mx-auto mb-6">
                <CalendarClock className="w-10 h-10 text-manatee" />
              </div>
              <h3 className="text-xl font-bold text-black mb-3">등록된 업무가 없습니다</h3>
              <p className="text-waterloo mb-8">선택한 날짜에 등록된 업무가 없습니다</p>
              <Link
                href="/work"
                className="inline-flex items-center space-x-2 px-8 py-4 bg-Primary hover:bg-Primary-hover text-white rounded-xl font-semibold transition-all shadow-solid-5"
              >
                <Plus className="w-5 h-5" />
                <span>업무 기록하기</span>
              </Link>
            </div>
          ) : (
            <div className="relative">
              {/* Timeline Line */}
              <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-stroke" />

              {/* Timeline Items */}
              <div className="space-y-8">
                {workEntries.map((entry, index) => (
                  <div key={entry.id} className="relative pl-20">
                    {/* Timeline Dot */}
                    <div className="absolute left-6 top-6 w-5 h-5 bg-Primary rounded-full border-4 border-white shadow-solid-2" />

                    {/* Timeline Card */}
                    <div
                      className="bg-white rounded-xl border border-stroke p-6 shadow-solid-2 hover:border-Primary/30 transition-all cursor-pointer"
                      onClick={() => handleWorkClick(entry)}
                    >
                      {/* Header */}
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <div className="w-8 h-8 bg-Primary/10 rounded-full flex items-center justify-center">
                              <User className="w-4 h-4 text-Primary" />
                            </div>
                            <span className="font-semibold text-Primary">{entry.username}</span>
                            <span className="text-sm text-waterloo">
                              {new Date(entry.created_at).toLocaleTimeString('ko-KR', {
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </span>
                          </div>
                          <h3 className="text-xl font-bold text-black mb-2">{entry.title}</h3>
                          {entry.description && (
                            <p className="text-waterloo leading-relaxed line-clamp-2">{entry.description}</p>
                          )}
                        </div>

                        {/* Status Badge */}
                        <div className={`px-4 py-2 rounded-lg font-semibold text-sm border-2 ${getStatusColor(entry.status)}`}>
                          {getStatusText(entry.status)}
                        </div>
                      </div>

                      {/* Tags */}
                      {entry.tags && entry.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {entry.tags.map((tag) => (
                            <span
                              key={tag}
                              className="px-3 py-1 bg-Primary/10 text-Primary rounded-lg font-medium text-sm"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Login Modal */}
      {showLoginModal && <LoginModal onLogin={handleLogin} />}

      {/* Work Detail Modal */}
      {selectedEntry && (
        <WorkDetailModal
          entry={selectedEntry}
          onClose={() => setSelectedEntry(null)}
          onUpdate={handleWorkUpdate}
          onDelete={handleWorkDelete}
        />
      )}
    </div>
  )
}
