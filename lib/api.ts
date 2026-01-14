// API Client for Work Management System

import axios from 'axios'
import type {
  Team,
  TeamMember,
  WorkEntry,
  DailySummary,
  WorkInsight,
  CreateWorkEntryRequest,
  ClaudeSummaryRequest,
} from './types'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://curieus.net'

const api = axios.create({
  baseURL: `${API_BASE_URL}/api/work-management`,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Interceptor for authentication
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export const workManagementApi = {
  // Team Management
  teams: {
    list: async (): Promise<Team[]> => {
      const response = await api.get('/teams')
      return response.data
    },
    get: async (teamName: string): Promise<Team> => {
      const response = await api.get(`/teams/${teamName}`)
      return response.data
    },
    create: async (data: { name: string; description?: string }): Promise<Team> => {
      const response = await api.post('/teams', data)
      return response.data
    },
    update: async (teamName: string, data: Partial<Team>): Promise<Team> => {
      const response = await api.put(`/teams/${teamName}`, data)
      return response.data
    },
    delete: async (teamName: string): Promise<void> => {
      await api.delete(`/teams/${teamName}`)
    },
  },

  // Member Management
  members: {
    list: async (teamName: string): Promise<TeamMember[]> => {
      const response = await api.get(`/teams/${teamName}/members`)
      return response.data
    },
    add: async (teamName: string, member: Omit<TeamMember, 'id'>): Promise<TeamMember> => {
      const response = await api.post(`/teams/${teamName}/members`, member)
      return response.data
    },
    update: async (
      teamName: string,
      username: string,
      data: Partial<TeamMember>
    ): Promise<TeamMember> => {
      const response = await api.put(`/teams/${teamName}/members/${username}`, data)
      return response.data
    },
    remove: async (teamName: string, username: string): Promise<void> => {
      await api.delete(`/teams/${teamName}/members/${username}`)
    },
  },

  // Work Entry Management
  workEntries: {
    create: async (data: CreateWorkEntryRequest): Promise<WorkEntry> => {
      const response = await api.post('/work-entries', data)
      return response.data
    },
    list: async (
      teamName: string,
      username: string,
      params?: {
        start_date?: string
        end_date?: string
        status?: string
      }
    ): Promise<WorkEntry[]> => {
      const response = await api.get(`/teams/${teamName}/members/${username}/work-entries`, {
        params,
      })
      return response.data
    },
    get: async (teamName: string, username: string, date: string): Promise<WorkEntry[]> => {
      const response = await api.get(
        `/teams/${teamName}/members/${username}/work-entries/${date}`
      )
      return response.data
    },
    update: async (
      teamName: string,
      username: string,
      workId: string,
      data: Partial<WorkEntry>
    ): Promise<WorkEntry> => {
      const response = await api.put(
        `/teams/${teamName}/members/${username}/work-entries/${workId}`,
        data
      )
      return response.data
    },
    delete: async (teamName: string, username: string, workId: string): Promise<void> => {
      await api.delete(`/teams/${teamName}/members/${username}/work-entries/${workId}`)
    },
    fromClaudeSummary: async (data: ClaudeSummaryRequest): Promise<WorkEntry[]> => {
      const response = await api.post('/work-entries/from-claude', data)
      return response.data
    },
  },

  // Team Analysis
  analysis: {
    dailySummary: async (teamName: string, date?: string): Promise<DailySummary> => {
      const response = await api.get(`/teams/${teamName}/analysis/daily`, {
        params: { date },
      })
      return response.data
    },
    conflicts: async (teamName: string, date?: string): Promise<any[]> => {
      const response = await api.get(`/teams/${teamName}/analysis/conflicts`, {
        params: { date },
      })
      return response.data
    },
    workload: async (teamName: string, date?: string): Promise<any> => {
      const response = await api.get(`/teams/${teamName}/analysis/workload`, {
        params: { date },
      })
      return response.data
    },
    standupReport: async (teamName: string, date?: string): Promise<string> => {
      const response = await api.get(`/teams/${teamName}/analysis/standup`, {
        params: { date },
      })
      return response.data
    },
    insights: async (
      teamName: string,
      startDate: string,
      endDate: string
    ): Promise<WorkInsight[]> => {
      const response = await api.get(`/teams/${teamName}/analysis/insights`, {
        params: { start_date: startDate, end_date: endDate },
      })
      return response.data
    },
  },

  // Personal Analysis
  personal: {
    progress: async (teamName: string, username: string, days?: number): Promise<any> => {
      const response = await api.get(`/teams/${teamName}/members/${username}/progress`, {
        params: { days },
      })
      return response.data
    },
    report: async (
      teamName: string,
      username: string,
      startDate: string,
      endDate: string
    ): Promise<string> => {
      const response = await api.get(`/teams/${teamName}/members/${username}/report`, {
        params: { start_date: startDate, end_date: endDate },
      })
      return response.data
    },
  },
}

export default api
