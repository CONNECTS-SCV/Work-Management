// OpenAI Client for Work Management
import OpenAI from 'openai'

export function getOpenAIClient(): OpenAI | null {
  if (typeof window === 'undefined') {
    return null // Don't initialize on server side
  }

  const apiKey = localStorage.getItem('openai_api_key')
  if (!apiKey) {
    return null
  }

  return new OpenAI({
    apiKey,
    dangerouslyAllowBrowser: true, // Required for client-side usage
  })
}

export function setOpenAIKey(apiKey: string) {
  if (typeof window !== 'undefined') {
    localStorage.setItem('openai_api_key', apiKey)
  }
}

export function getOpenAIKey(): string | null {
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

  const prompt = `다음 텍스트를 분석하여 업무 항목들을 추출해주세요. 각 업무는 JSON 형태로 변환해주세요.

텍스트:
${text}

다음 형식의 JSON 배열로 응답해주세요:
[
  {
    "title": "업무 제목",
    "description": "업무 설명",
    "category": "development|research|meeting|review|documentation|testing|deployment|planning|other",
    "priority": "low|medium|high|urgent",
    "status": "not_started|in_progress|completed",
    "tags": ["태그1", "태그2"],
    "estimated_hours": 숫자 또는 null
  }
]

중요: 반드시 유효한 JSON 배열만 응답해주세요. 다른 텍스트는 포함하지 마세요.`

  const response = await client.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      {
        role: 'system',
        content: 'You are a helpful assistant that extracts work items from text and returns them as valid JSON arrays. Always respond with only valid JSON, no additional text.',
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
