// Work Management Types

export type WorkStatus = 'not_started' | 'in_progress' | 'completed' | 'blocked' | 'cancelled'
export type WorkPriority = 'low' | 'medium' | 'high' | 'urgent'
export type WorkCategory =
  | 'development'
  | 'research'
  | 'meeting'
  | 'review'
  | 'documentation'
  | 'testing'
  | 'deployment'
  | 'planning'
  | 'other'

export interface TeamMember {
  id?: number
  username: string
  email?: string
  role: string
  is_active: boolean
  joined_at: string
  agent_conversation_id?: string
  agent_last_active?: string
}

export interface Team {
  id?: number
  name: string
  description?: string
  created_at: string
  updated_at?: string
  agent_conversation_id?: string
  agent_last_active?: string
  members?: TeamMember[]
}

export interface WorkEntry {
  id: string
  title: string
  description: string
  raw_input: string
  category: WorkCategory
  status: WorkStatus
  priority: WorkPriority
  tags: string[]
  estimated_hours?: number
  actual_hours?: number
  project?: string
  dependencies: string[]
  blockers: string[]
  related_work_ids: string[]
  agent_summary?: string
  created_at: string
  updated_at: string
}

export interface DailySummary {
  date: string
  team: string
  statistics: {
    total_work_items: number
    completed_items: number
    in_progress_items: number
    blocked_items: number
    cancelled_items: number
    active_members: number
    total_hours_logged: number
  }
  members_summary: {
    [username: string]: {
      work_items: number
      completed: number
      hours: number
      status: string
      workload_level: string
    }
  }
  key_achievements?: Array<{
    member: string
    achievement: string
    impact: string
  }>
  detected_conflicts: Array<{
    type: string
    severity: string
    members: string[]
    description: string
    suggestion: string
  }>
  dependencies: Array<{
    blocked_work_id: string
    blocked_member: string
    depends_on_work_id: string
    depends_on_member: string
    estimated_completion?: string
  }>
  blockers: any[]
  workload_distribution: {
    [username: string]: number
  }
  resource_warnings: Array<{
    type: string
    member?: string
    hours?: number
    threshold?: number
    suggestion: string
  }>
  standup_report?: string
  created_at: string
}

export interface WorkInsight {
  id?: number
  team_id: number
  insight_type: string
  title: string
  description?: string
  severity: string
  related_work_ids?: string[]
  related_member_ids?: number[]
  metadata?: any
  is_acknowledged: boolean
  acknowledged_by?: number
  acknowledged_at?: string
  created_at: string
}

export interface CreateWorkEntryRequest {
  team_name: string
  username: string
  title: string
  description: string
  raw_input: string
  category?: WorkCategory
  status?: WorkStatus
  priority?: WorkPriority
  tags?: string[]
  estimated_hours?: number
  actual_hours?: number
  project?: string
  dependencies?: string[]
  blockers?: string[]
  work_date?: string
}

export interface ClaudeSummaryRequest {
  team_name: string
  username: string
  summary: string
  work_date?: string
}
