// 간단한 로컬스토리지 기반 인증 시스템

export interface User {
  username: string
  email?: string
  avatar?: string
  role?: string
}

const AUTH_KEY = 'work_management_user'
const TEAM_MEMBERS_KEY = 'work_management_team_members'

export const authService = {
  // 현재 사용자 가져오기
  getCurrentUser: (): User | null => {
    if (typeof window === 'undefined') return null
    const stored = localStorage.getItem(AUTH_KEY)
    return stored ? JSON.parse(stored) : null
  },

  // 사용자 설정
  setCurrentUser: (user: User): void => {
    if (typeof window === 'undefined') return
    localStorage.setItem(AUTH_KEY, JSON.stringify(user))

    // 팀 멤버 목록에도 추가
    const members = authService.getTeamMembers()
    if (!members.find(m => m.username === user.username)) {
      members.push(user)
      authService.setTeamMembers(members)
    }
  },

  // 로그아웃
  logout: (): void => {
    if (typeof window === 'undefined') return
    localStorage.removeItem(AUTH_KEY)
  },

  // 팀 멤버 목록 가져오기
  getTeamMembers: (): User[] => {
    if (typeof window === 'undefined') return []
    const stored = localStorage.getItem(TEAM_MEMBERS_KEY)
    return stored ? JSON.parse(stored) : []
  },

  // 팀 멤버 목록 설정
  setTeamMembers: (members: User[]): void => {
    if (typeof window === 'undefined') return
    localStorage.setItem(TEAM_MEMBERS_KEY, JSON.stringify(members))
  },

  // 사용자 전환
  switchUser: (username: string): boolean => {
    const members = authService.getTeamMembers()
    const user = members.find(m => m.username === username)
    if (user) {
      authService.setCurrentUser(user)
      return true
    }
    return false
  }
}
