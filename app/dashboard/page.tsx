'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Users, CheckCircle2, Clock, AlertCircle, Plus, TrendingUp, Calendar, Sparkles, User, Trash2 } from 'lucide-react'
import { workManagementApi } from '@/lib/api'
import type { WorkEntry, WorkStatus, DailySummary } from '@/lib/types'

type ViewMode = 'personal' | 'team'
type FilterUser = 'all' | string

export default function DashboardPage() {
  const [workEntries, setWorkEntries] = useState<WorkEntry[]>([])
  const [allEntries, setAllEntries] = useState<WorkEntry[]>([])
  const [summary, setSummary] = useState<DailySummary | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])
  const [error, setError] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<ViewMode>('personal')
  const [filterUser, setFilterUser] = useState<FilterUser>('all')
  const [users, setUsers] = useState<string[]>([])

  const TEAM_NAME = 'curieus' // 기본 팀 이름
  const USERNAME = '차성욱' // TODO: 실제 로그인 사용자로 변경

  useEffect(() => {
    loadData()
  }, [selectedDate, viewMode])

  const loadData = async () => {
    try {
      setLoading(true)
      setError(null)

      if (viewMode === 'personal') {
        // 개인 뷰: 내 업무만
        const [entries, dailySummary] = await Promise.all([
          workManagementApi.workEntries.get(TEAM_NAME, USERNAME, selectedDate),
          workManagementApi.analysis.dailySummary(TEAM_NAME, selectedDate)
        ])
        setWorkEntries(entries)
        setSummary(dailySummary)
      } else {
        // 팀 뷰: 전체 업무
        const [entries, dailySummary] = await Promise.all([
          workManagementApi.workEntries.getAll(TEAM_NAME, selectedDate),
          workManagementApi.analysis.dailySummary(TEAM_NAME, selectedDate)
        ])
        setAllEntries(entries)

        // 사용자 목록 추출
        const uniqueUsers = Array.from(new Set(entries.map(e => e.username)))
        setUsers(uniqueUsers)

        // 필터 적용
        if (filterUser === 'all') {
          setWorkEntries(entries)
        } else {
          setWorkEntries(entries.filter(e => e.username === filterUser))
        }
        setSummary(dailySummary)
      }
    } catch (err: any) {
      console.error('Failed to load data:', err)
      setError(err.message || '데이터를 불러오는데 실패했습니다')
      setWorkEntries([])
      setSummary(null)
    } finally {
      setLoading(false)
    }
  }

  // 필터 변경 시 재필터링
  useEffect(() => {
    if (viewMode === 'team') {
      if (filterUser === 'all') {
        setWorkEntries(allEntries)
      } else {
        setWorkEntries(allEntries.filter(e => e.username === filterUser))
      }
    }
  }, [filterUser, viewMode, allEntries])

  const handleStatusChange = async (entryId: string, newStatus: string, username: string) => {
    try {
      await workManagementApi.workEntries.update(TEAM_NAME, username, entryId, {
        status: newStatus as WorkStatus
      })
      loadData() // 새로고침
    } catch (error) {
      console.error('Failed to update status:', error)
      alert('상태 업데이트에 실패했습니다')
    }
  }

  const handleDelete = async (entryId: string, username: string) => {
    if (!confirm('정말 이 업무를 삭제하시겠습니까?')) {
      return
    }

    try {
      await workManagementApi.workEntries.delete(TEAM_NAME, username, entryId)
      loadData() // 새로고침
    } catch (error) {
      console.error('Failed to delete work entry:', error)
      alert('업무 삭제에 실패했습니다')
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

  const stats = {
    completed: summary?.statistics?.completed_items || 0,
    in_progress: summary?.statistics?.in_progress_items || 0,
    blocked: summary?.statistics?.blocked_items || 0,
    not_started: (summary?.statistics?.total_work_items || 0) - (summary?.statistics?.completed_items || 0) - (summary?.statistics?.in_progress_items || 0) - (summary?.statistics?.blocked_items || 0)
  }

  return (
    <div className="min-h-screen bg-Background">
      {/* Header */}
      <header className="bg-white border-b border-stroke sticky top-0 z-50 backdrop-blur-sm bg-white/95">
        <div className="container mx-auto px-6 lg:px-12">
          <div className="flex items-center justify-between h-20">
            <Link href="/dashboard" className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-Primary rounded-xl flex items-center justify-center shadow-solid-5">
                <TrendingUp className="w-5 h-5 text-white" />
              </div>
              <span className="text-2xl font-bold text-black">Work</span>
            </Link>
            <div className="flex items-center space-x-3">
              <Link
                href="/work"
                className="px-6 py-3 bg-Primary hover:bg-Primary-hover text-white rounded-xl font-semibold transition-all shadow-solid-5 hover:shadow-solid-10 inline-flex items-center space-x-2"
              >
                <Plus className="w-4 h-4" />
                <span>업무 기록</span>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-6 lg:px-12 py-12">
        {/* Top Bar */}
        <div className="flex items-center justify-between mb-10">
          <div>
            <h1 className="text-4xl font-bold text-black mb-2">대시보드</h1>
            <p className="text-waterloo text-lg">팀의 업무 현황을 한눈에 확인하세요</p>
          </div>
          <div className="flex items-center space-x-3">
            {/* View Mode Toggle */}
            <div className="flex items-center bg-white rounded-xl border border-stroke shadow-solid-2 p-1">
              <button
                onClick={() => {
                  setViewMode('personal')
                  setFilterUser('all')
                }}
                className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all flex items-center space-x-2 ${
                  viewMode === 'personal'
                    ? 'bg-Primary text-white shadow-solid-5'
                    : 'text-waterloo hover:text-black'
                }`}
              >
                <User className="w-4 h-4" />
                <span>내 업무</span>
              </button>
              <button
                onClick={() => setViewMode('team')}
                className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all flex items-center space-x-2 ${
                  viewMode === 'team'
                    ? 'bg-Primary text-white shadow-solid-5'
                    : 'text-waterloo hover:text-black'
                }`}
              >
                <Users className="w-4 h-4" />
                <span>팀 전체</span>
              </button>
            </div>

            {/* User Filter (팀 뷰일 때만) */}
            {viewMode === 'team' && users.length > 0 && (
              <select
                value={filterUser}
                onChange={(e) => setFilterUser(e.target.value)}
                className="px-4 py-2.5 bg-white rounded-xl border border-stroke shadow-solid-2 font-semibold text-sm outline-none cursor-pointer hover:border-Primary/30 transition-all"
              >
                <option value="all">전체 팀원 ({users.length}명)</option>
                {users.map(user => (
                  <option key={user} value={user}>{user}</option>
                ))}
              </select>
            )}

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

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <StatCard
            icon={<CheckCircle2 className="w-7 h-7" />}
            label="완료"
            value={stats.completed}
            bgColor="bg-meta"
          />
          <StatCard
            icon={<Clock className="w-7 h-7" />}
            label="진행중"
            value={stats.in_progress}
            bgColor="bg-mainblue"
          />
          <StatCard
            icon={<AlertCircle className="w-7 h-7" />}
            label="막힘"
            value={stats.blocked}
            bgColor="bg-red-500"
          />
          <StatCard
            icon={<Users className="w-7 h-7" />}
            label="전체"
            value={workEntries.length}
            bgColor="bg-Primary"
          />
        </div>

        {/* Work List & Sidebar */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Work List */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl border border-stroke p-8 shadow-solid-2">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-black">오늘의 업무</h2>
                {workEntries.length > 0 && (
                  <span className="text-sm text-waterloo font-medium">
                    {workEntries.length}개
                  </span>
                )}
              </div>

              {workEntries.length === 0 ? (
                <div className="text-center py-20">
                  <div className="w-20 h-20 bg-Background rounded-full flex items-center justify-center mx-auto mb-6">
                    <Sparkles className="w-10 h-10 text-manatee" />
                  </div>
                  <h3 className="text-xl font-bold text-black mb-3">아직 등록된 업무가 없습니다</h3>
                  <p className="text-waterloo mb-8">첫 업무를 기록하고 팀 생산성을 높여보세요</p>
                  <Link
                    href="/work"
                    className="inline-flex items-center space-x-2 px-8 py-4 bg-Primary hover:bg-Primary-hover text-white rounded-xl font-semibold transition-all shadow-solid-5"
                  >
                    <Plus className="w-5 h-5" />
                    <span>업무 기록하기</span>
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {workEntries.map((entry) => (
                    <WorkEntryCard
                      key={entry.id}
                      entry={entry}
                      onStatusChange={handleStatusChange}
                      onDelete={handleDelete}
                      showUsername={viewMode === 'team'}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <div className="bg-white rounded-2xl border border-stroke p-6 shadow-solid-2">
              <h3 className="font-bold text-black mb-4 text-lg">빠른 작업</h3>
              <div className="space-y-3">
                <Link
                  href="/work"
                  className="block w-full px-5 py-3.5 bg-Primary hover:bg-Primary-hover text-white rounded-xl font-semibold transition-all text-center shadow-solid-5"
                >
                  <Plus className="w-4 h-4 inline-block mr-2" />
                  업무 기록
                </Link>
                <button
                  onClick={() => loadData()}
                  className="block w-full px-5 py-3.5 bg-Background hover:bg-Secondary/30 text-Primary rounded-xl font-semibold transition-all border border-stroke"
                >
                  새로고침
                </button>
              </div>
            </div>

            {/* Team Progress */}
            {summary && summary.members_summary && Object.keys(summary.members_summary).length > 0 && (
              <div className="bg-white rounded-2xl border border-stroke p-6 shadow-solid-2">
                <h3 className="font-bold text-black mb-5 text-lg">팀 진행상황</h3>
                <div className="space-y-5">
                  {Object.entries(summary.members_summary).map(([username, userStats]) => (
                    <div key={username}>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <div className="w-8 h-8 bg-Primary/10 rounded-full flex items-center justify-center">
                            <span className="text-sm font-bold text-Primary">
                              {username.charAt(0)}
                            </span>
                          </div>
                          <span className="font-semibold text-black">{username}</span>
                        </div>
                        <span className="text-sm text-waterloo font-medium">{userStats.work_items}개</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="flex-1 h-2.5 bg-Background rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-meta to-Primary rounded-full transition-all"
                            style={{
                              width: `${userStats.work_items > 0 ? (userStats.completed / userStats.work_items) * 100 : 0}%`
                            }}
                          />
                        </div>
                        <span className="text-sm text-Primary font-bold">
                          {userStats.work_items > 0 ? Math.round((userStats.completed / userStats.work_items) * 100) : 0}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function StatCard({
  icon,
  label,
  value,
  bgColor
}: {
  icon: React.ReactNode
  label: string
  value: number
  bgColor: string
}) {
  return (
    <div className="bg-white rounded-2xl border border-stroke p-6 hover:border-Primary/30 transition-all shadow-solid-2 hover:shadow-solid-5">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-waterloo font-medium mb-2">{label}</p>
          <p className="text-4xl font-bold text-black">{value}</p>
        </div>
        <div className={`w-14 h-14 ${bgColor} rounded-2xl flex items-center justify-center text-white shadow-solid-5`}>
          {icon}
        </div>
      </div>
    </div>
  )
}

function WorkEntryCard({
  entry,
  onStatusChange,
  onDelete,
  showUsername = false
}: {
  entry: WorkEntry
  onStatusChange: (id: string, status: string, username: string) => void
  onDelete: (id: string, username: string) => void
  showUsername?: boolean
}) {
  return (
    <div className="p-5 bg-Background rounded-xl border border-stroke hover:border-Primary/30 transition-all">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          {showUsername && entry.username && (
            <div className="flex items-center space-x-2 mb-2">
              <div className="w-6 h-6 bg-Primary/10 rounded-full flex items-center justify-center">
                <User className="w-3.5 h-3.5 text-Primary" />
              </div>
              <span className="text-sm font-semibold text-Primary">{entry.username}</span>
            </div>
          )}
          <h3 className="font-bold text-black text-lg">{entry.title}</h3>
        </div>
        <div className="flex items-center space-x-2 ml-4">
          <select
            value={entry.status}
            onChange={(e) => onStatusChange(entry.id, e.target.value, entry.username)}
            className={`px-4 py-2 rounded-lg text-sm font-semibold border-2 outline-none cursor-pointer transition-colors
              ${entry.status === 'completed' ? 'bg-meta/10 border-meta text-meta' : ''}
              ${entry.status === 'in_progress' ? 'bg-mainblue/10 border-mainblue text-mainblue' : ''}
              ${entry.status === 'blocked' ? 'bg-red-50 border-red-500 text-red-500' : ''}
              ${entry.status === 'not_started' ? 'bg-manatee/10 border-manatee text-manatee' : ''}
            `}
          >
            <option value="not_started">할 일</option>
            <option value="in_progress">진행중</option>
            <option value="completed">완료</option>
            <option value="blocked">막힘</option>
          </select>
          <button
            onClick={() => onDelete(entry.id, entry.username)}
            className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-all"
            title="삭제"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {entry.description && (
        <p className="text-waterloo mb-3 leading-relaxed line-clamp-2">{entry.description}</p>
      )}

      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center space-x-2">
          {entry.tags && entry.tags.map((tag) => (
            <span key={tag} className="px-3 py-1 bg-Primary/10 text-Primary rounded-lg font-medium">
              {tag}
            </span>
          ))}
        </div>
        <span className="text-waterloo font-medium">
          {new Date(entry.created_at).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })}
        </span>
      </div>
    </div>
  )
}
