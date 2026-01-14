'use client'

import { useState } from 'react'
import { X, Calendar, User, Tag, Clock, MessageSquare, Edit2, Trash2 } from 'lucide-react'
import type { WorkEntry } from '@/lib/types'

interface WorkDetailModalProps {
  entry: WorkEntry
  onClose: () => void
  onUpdate: (id: string, data: Partial<WorkEntry>) => void
  onDelete: (id: string) => void
}

export default function WorkDetailModal({ entry, onClose, onUpdate, onDelete }: WorkDetailModalProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editedTitle, setEditedTitle] = useState(entry.title)
  const [editedDescription, setEditedDescription] = useState(entry.description)

  const handleSave = () => {
    onUpdate(entry.id, {
      title: editedTitle,
      description: editedDescription
    })
    setIsEditing(false)
  }

  const handleDelete = () => {
    if (confirm('정말 이 업무를 삭제하시겠습니까?')) {
      onDelete(entry.id)
      onClose()
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

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-solid-10 max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        {/* 헤더 */}
        <div className="sticky top-0 bg-white border-b border-stroke px-8 py-6 flex items-start justify-between">
          <div className="flex-1 pr-4">
            {isEditing ? (
              <input
                type="text"
                value={editedTitle}
                onChange={(e) => setEditedTitle(e.target.value)}
                className="text-3xl font-bold text-black w-full outline-none border-b-2 border-Primary pb-2"
                autoFocus
              />
            ) : (
              <h2 className="text-3xl font-bold text-black">{entry.title}</h2>
            )}
          </div>
          <div className="flex items-center space-x-2">
            {isEditing ? (
              <>
                <button
                  onClick={handleSave}
                  className="px-4 py-2 bg-Primary text-white rounded-lg font-semibold hover:bg-Primary-hover transition-all"
                >
                  저장
                </button>
                <button
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2 bg-stroke text-black rounded-lg font-semibold hover:bg-Secondary transition-all"
                >
                  취소
                </button>
              </>
            ) : (
              <button
                onClick={() => setIsEditing(true)}
                className="p-2 hover:bg-Background rounded-lg transition-all"
                title="수정"
              >
                <Edit2 className="w-5 h-5 text-waterloo" />
              </button>
            )}
            <button
              onClick={handleDelete}
              className="p-2 hover:bg-red-50 rounded-lg transition-all"
              title="삭제"
            >
              <Trash2 className="w-5 h-5 text-red-500" />
            </button>
            <button
              onClick={onClose}
              className="p-2 hover:bg-Background rounded-lg transition-all"
            >
              <X className="w-5 h-5 text-waterloo" />
            </button>
          </div>
        </div>

        {/* 메타 정보 */}
        <div className="px-8 py-6 border-b border-stroke">
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-Primary/10 rounded-full flex items-center justify-center">
                <User className="w-5 h-5 text-Primary" />
              </div>
              <div>
                <p className="text-sm text-manatee">담당자</p>
                <p className="font-semibold text-black">{entry.username}</p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <div className={`px-4 py-2 rounded-lg font-semibold border-2 ${getStatusColor(entry.status)}`}>
                {getStatusText(entry.status)}
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-Background rounded-full flex items-center justify-center">
                <Calendar className="w-5 h-5 text-waterloo" />
              </div>
              <div>
                <p className="text-sm text-manatee">작업 날짜</p>
                <p className="font-semibold text-black">{entry.work_date}</p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-Background rounded-full flex items-center justify-center">
                <Clock className="w-5 h-5 text-waterloo" />
              </div>
              <div>
                <p className="text-sm text-manatee">생성 시간</p>
                <p className="font-semibold text-black">
                  {new Date(entry.created_at).toLocaleTimeString('ko-KR', {
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </div>
            </div>
          </div>

          {/* 태그 */}
          {entry.tags && entry.tags.length > 0 && (
            <div className="mt-6">
              <div className="flex items-center space-x-2 mb-3">
                <Tag className="w-4 h-4 text-waterloo" />
                <p className="text-sm font-semibold text-manatee">태그</p>
              </div>
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
            </div>
          )}
        </div>

        {/* 설명 */}
        <div className="px-8 py-6">
          <h3 className="text-lg font-bold text-black mb-4">상세 내용</h3>
          {isEditing ? (
            <textarea
              value={editedDescription}
              onChange={(e) => setEditedDescription(e.target.value)}
              className="w-full min-h-[200px] px-4 py-3 rounded-xl border-2 border-stroke outline-none focus:border-Primary transition-colors font-medium resize-none"
              placeholder="업무 상세 내용을 입력하세요..."
            />
          ) : (
            <div className="prose max-w-none">
              {entry.description ? (
                <p className="text-waterloo leading-relaxed whitespace-pre-wrap">
                  {entry.description}
                </p>
              ) : (
                <p className="text-manatee italic">상세 내용이 없습니다</p>
              )}
            </div>
          )}
        </div>

        {/* 활동 기록 */}
        <div className="px-8 py-6 border-t border-stroke bg-Background/50">
          <div className="flex items-center space-x-2 mb-4">
            <MessageSquare className="w-4 h-4 text-waterloo" />
            <h3 className="text-lg font-bold text-black">활동 기록</h3>
          </div>
          <div className="space-y-3">
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 bg-Primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                <User className="w-4 h-4 text-Primary" />
              </div>
              <div className="flex-1">
                <p className="text-sm">
                  <span className="font-semibold text-black">{entry.username}</span>
                  <span className="text-manatee">님이 업무를 생성했습니다</span>
                </p>
                <p className="text-xs text-manatee mt-1">
                  {new Date(entry.created_at).toLocaleString('ko-KR')}
                </p>
              </div>
            </div>

            {entry.updated_at !== entry.created_at && (
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-mainblue/10 rounded-full flex items-center justify-center flex-shrink-0">
                  <Edit2 className="w-4 h-4 text-mainblue" />
                </div>
                <div className="flex-1">
                  <p className="text-sm">
                    <span className="font-semibold text-black">{entry.username}</span>
                    <span className="text-manatee">님이 업무를 수정했습니다</span>
                  </p>
                  <p className="text-xs text-manatee mt-1">
                    {new Date(entry.updated_at).toLocaleString('ko-KR')}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
