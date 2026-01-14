'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { TrendingUp, Plus, LogOut, LayoutDashboard, CalendarClock, Columns3, User, Calendar } from 'lucide-react'
import { workManagementApi } from '@/lib/api'
import type { WorkEntry, WorkStatus } from '@/lib/types'
import { authService } from '@/lib/auth'
import LoginModal from '@/components/LoginModal'
import WorkDetailModal from '@/components/WorkDetailModal'

type ColumnType = 'not_started' | 'in_progress' | 'completed' | 'blocked'

export default function KanbanPage() {
  const [workEntries, setWorkEntries] = useState<WorkEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])
  const [error, setError] = useState<string | null>(null)
  const [currentUser, setCurrentUser] = useState<string | null>(null)
  const [showLoginModal, setShowLoginModal] = useState(false)
  const [selectedEntry, setSelectedEntry] = useState<WorkEntry | null>(null)
  const [draggedEntry, setDraggedEntry] = useState<WorkEntry | null>(null)

  const TEAM_NAME = 'curieus'

  const columns: { id: ColumnType; title: string; color: string }[] = [
    { id: 'not_started', title: '할 일', color: 'bg-manatee' },
    { id: 'in_progress', title: '진행중', color: 'bg-mainblue' },
    { id: 'completed', title: '완료', color: 'bg-meta' },
    { id: 'blocked', title: '막힘', color: 'bg-red-500' },
  ]

  // 사용자 인증 체크
  useEffect(() => {
    const user = authService.getCurrentUser()
    if (user) {
      setCurrentUser(user.username)
    } else {
      setShowLoginModal(true)
    }
  }, [])

  // currentUser 변경 시 데이터 로드
  useEffect(() => {
    if (currentUser) {
      loadData()
    }
  }, [selectedDate, currentUser])

  const loadData = async () => {
    if (!currentUser) return

    try {
      setLoading(true)
      setError(null)
      const entries = await workManagementApi.workEntries.getAll(TEAM_NAME, selectedDate)
      setWorkEntries(entries)
    } catch (err: any) {
      console.error('Failed to load data:', err)
      setError(err.message || '데이터를 불러오는데 실패했습니다')
      setWorkEntries([])
    } finally {
      setLoading(false)
    }
  }

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

  const handleDragStart = (entry: WorkEntry) => {
    setDraggedEntry(entry)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  const handleDrop = async (newStatus: ColumnType) => {
    if (!draggedEntry) return

    try {
      await workManagementApi.workEntries.update(
        TEAM_NAME,
        draggedEntry.username,
        draggedEntry.id,
        { status: newStatus as WorkStatus }
      )
      setDraggedEntry(null)
      loadData()
    } catch (error) {
      console.error('Failed to update status:', error)
      alert('상태 업데이트에 실패했습니다')
    }
  }

  const getEntriesByStatus = (status: ColumnType) => {
    return workEntries.filter(e => e.status === status)
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
                  className="px-4 py-2 text-waterloo hover:bg-Background rounded-lg font-semibold transition-all flex items-center space-x-2"
                >
                  <CalendarClock className="w-4 h-4" />
                  <span>타임라인</span>
                </Link>
                <Link
                  href="/kanban"
                  className="px-4 py-2 bg-Primary/10 text-Primary rounded-lg font-semibold transition-all flex items-center space-x-2"
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
            <h1 className="text-4xl font-bold text-black mb-2">칸반 보드</h1>
            <p className="text-waterloo text-lg">드래그 앤 드롭으로 업무 상태를 관리하세요</p>
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

        {/* Kanban Columns */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {columns.map((column) => {
            const columnEntries = getEntriesByStatus(column.id)

            return (
              <div
                key={column.id}
                className="bg-white rounded-xl border border-stroke p-5 min-h-[600px]"
                onDragOver={handleDragOver}
                onDrop={() => handleDrop(column.id)}
              >
                {/* Column Header */}
                <div className="flex items-center justify-between mb-5 pb-4 border-b border-stroke">
                  <div className="flex items-center space-x-3">
                    <div className={`w-3 h-3 ${column.color} rounded-full`} />
                    <h3 className="font-bold text-black text-lg">{column.title}</h3>
                  </div>
                  <span className="text-sm font-semibold text-waterloo bg-Background px-3 py-1 rounded-lg">
                    {columnEntries.length}
                  </span>
                </div>

                {/* Column Cards */}
                <div className="space-y-3">
                  {columnEntries.length === 0 ? (
                    <div className="text-center py-12">
                      <p className="text-manatee text-sm">항목 없음</p>
                    </div>
                  ) : (
                    columnEntries.map((entry) => (
                      <div
                        key={entry.id}
                        draggable
                        onDragStart={() => handleDragStart(entry)}
                        onClick={() => handleWorkClick(entry)}
                        className="p-4 bg-Background rounded-lg border border-stroke hover:border-Primary/30 transition-all cursor-move hover:shadow-solid-2"
                      >
                        {/* User */}
                        <div className="flex items-center space-x-2 mb-3">
                          <div className="w-6 h-6 bg-Primary/10 rounded-full flex items-center justify-center">
                            <User className="w-3.5 h-3.5 text-Primary" />
                          </div>
                          <span className="text-sm font-semibold text-Primary">{entry.username}</span>
                        </div>

                        {/* Title */}
                        <h4 className="font-bold text-black mb-2 line-clamp-2">{entry.title}</h4>

                        {/* Description */}
                        {entry.description && (
                          <p className="text-waterloo text-sm mb-3 line-clamp-2">{entry.description}</p>
                        )}

                        {/* Tags */}
                        {entry.tags && entry.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {entry.tags.slice(0, 2).map((tag) => (
                              <span
                                key={tag}
                                className="px-2 py-1 bg-Primary/10 text-Primary rounded text-xs font-medium"
                              >
                                {tag}
                              </span>
                            ))}
                            {entry.tags.length > 2 && (
                              <span className="px-2 py-1 bg-manatee/10 text-manatee rounded text-xs font-medium">
                                +{entry.tags.length - 2}
                              </span>
                            )}
                          </div>
                        )}

                        {/* Time */}
                        <div className="mt-3 pt-3 border-t border-stroke">
                          <span className="text-xs text-waterloo">
                            {new Date(entry.created_at).toLocaleTimeString('ko-KR', {
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )
          })}
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
