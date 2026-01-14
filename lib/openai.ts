// OpenAI Client for Work Management
import OpenAI from 'openai'

export function getOpenAIClient(): OpenAI | null {
  // Try environment variable first
  const envApiKey = process.env.NEXT_PUBLIC_OPENAI_API_KEY
  if (envApiKey) {
    return new OpenAI({
      apiKey: envApiKey,
      dangerouslyAllowBrowser: true,
    })
  }

  // Fall back to localStorage (client-side only)
  if (typeof window === 'undefined') {
    return null
  }

  const apiKey = localStorage.getItem('openai_api_key')
  if (!apiKey) {
    return null
  }

  return new OpenAI({
    apiKey,
    dangerouslyAllowBrowser: true,
  })
}

export function setOpenAIKey(apiKey: string) {
  if (typeof window !== 'undefined') {
    localStorage.setItem('openai_api_key', apiKey)
  }
}

export function getOpenAIKey(): string | null {
  // Check environment variable first
  const envApiKey = process.env.NEXT_PUBLIC_OPENAI_API_KEY
  if (envApiKey) {
    return envApiKey
  }

  // Fall back to localStorage
  if (typeof window !== 'undefined') {
    return localStorage.getItem('openai_api_key')
  }
  return null
}

export function removeOpenAIKey() {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('openai_api_key')
  }
}

export async function parseWorkWithOpenAI(text: string): Promise<any[]> {
  const client = getOpenAIClient()
  if (!client) {
    throw new Error('OpenAI API key not configured. Please set your API key in settings.')
  }

  const prompt = `다음은 사용자가 정리한 업무 목록입니다. 각 업무를 JSON 배열로 변환해주세요.

입력 텍스트:
${text}

각 업무는 다음 형식으로 구분되어 있습니다:
- 제목: [업무 제목]
- 설명: [상세 내용]
- 카테고리: [development/research/meeting/review/documentation/testing/deployment/planning/other]
- 우선순위: [low/medium/high/urgent]
- 상태: [not_started/in_progress/completed/blocked]
- 태그: [태그1, 태그2, ...]
- 예상 시간: [숫자]

다음 형식의 JSON 배열로 응답해주세요:
[
  {
    "title": "업무 제목",
    "description": "업무 설명",
    "category": "development",
    "priority": "medium",
    "status": "in_progress",
    "tags": ["태그1", "태그2"],
    "estimated_hours": 3
  }
]

중요: 반드시 유효한 JSON 배열만 응답해주세요. 다른 텍스트는 포함하지 마세요.
태그는 배열 형태로 변환하고, 예상 시간이 없으면 null로 설정하세요.`

  const response = await client.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      {
        role: 'system',
        content: 'You are a helpful assistant that converts structured work item text into valid JSON arrays. Always respond with only valid JSON, no additional text.',
      },
      {
        role: 'user',
        content: prompt,
      },
    ],
    temperature: 0.1,
  })

  const content = response.choices[0]?.message?.content
  if (!content) {
    throw new Error('No response from OpenAI')
  }

  try {
    // Remove markdown code blocks if present
    const jsonText = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
    const workItems = JSON.parse(jsonText)
    return Array.isArray(workItems) ? workItems : [workItems]
  } catch (error) {
    console.error('Failed to parse OpenAI response:', content)
    throw new Error('Failed to parse work items from OpenAI response')
  }
}
