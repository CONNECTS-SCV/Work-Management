// AI Insights for Team Work Management
import OpenAI from 'openai'
import { getOpenAIClient } from './openai'
import type { WorkEntry, DailySummary } from './types'

export interface TeamInsight {
  summary: string
  keyProgress: string[]
  blockers: string[]
  nextActions: string[]
  risks: string[]
  momentum: 'high' | 'medium' | 'low'
}

export async function generateTeamInsights(
  workEntries: WorkEntry[],
  summary: DailySummary | null
): Promise<TeamInsight | null> {
  const client = getOpenAIClient()
  if (!client || workEntries.length === 0) {
    return null
  }

  // Prepare work data for analysis
  const workData = workEntries.map(entry => ({
    title: entry.title,
    status: entry.status,
    priority: entry.priority,
    category: entry.category,
    tags: entry.tags,
    blockers: entry.blockers,
    username: entry.username,
  }))

  const prompt = `다음은 팀의 업무 현황 데이터입니다. 간결하고 실용적인 인사이트를 제공해주세요.

업무 데이터:
${JSON.stringify(workData, null, 2)}

통계:
- 전체 업무: ${summary?.statistics?.total_work_items || workEntries.length}개
- 완료: ${summary?.statistics?.completed_items || 0}개
- 진행중: ${summary?.statistics?.in_progress_items || 0}개
- 블로킹: ${summary?.statistics?.blocked_items || 0}개

다음 JSON 형식으로 응답해주세요:
{
  "summary": "오늘 팀의 전체적인 진행 상황을 2-3문장으로 요약",
  "keyProgress": ["주요 진행사항 1", "주요 진행사항 2"],
  "blockers": ["현재 블로킹 요인 (있다면)"],
  "nextActions": ["다음에 집중해야 할 작업 1", "다음에 집중해야 할 작업 2"],
  "risks": ["주의가 필요한 리스크 (있다면)"],
  "momentum": "high|medium|low"
}

- summary: 전체적인 팀 상황을 한눈에 파악할 수 있도록
- keyProgress: 실제 완료되거나 진행중인 중요 업무만
- blockers: 블로킹 상태의 업무가 있다면 명시
- nextActions: 우선순위와 의존성을 고려한 다음 액션
- risks: 마감, 블로커, 높은 우선순위 미처리 등
- momentum: 팀의 전체적인 진행 속도 평가

반드시 유효한 JSON만 응답하세요.`

  try {
    const response = await client.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'You are an expert project manager analyzing team work progress. Provide concise, actionable insights in Korean. Always respond with valid JSON only.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.3,
    })

    const content = response.choices[0]?.message?.content
    if (!content) {
      return null
    }

    // Parse JSON response
    const jsonText = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
    return JSON.parse(jsonText) as TeamInsight
  } catch (error) {
    console.error('Failed to generate team insights:', error)
    return null
  }
}
