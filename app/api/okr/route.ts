import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const { action, goal, keyResults, progress } = await req.json()
  const apiKey = process.env.OPENAI_API_KEY

  if (!apiKey) {
    return NextResponse.json({ error: 'No OpenAI API key configured.' }, { status: 500 })
  }

  let systemPrompt = ''
  let userPrompt = ''

  if (action === 'generate_okr') {
    systemPrompt = `You are a strategic goal coach who specializes in the OKR framework.
Your job is to transform vague goals into precise, measurable Objectives and Key Results.
Be ambitious but realistic. Key Results must be specific and measurable with numbers.
Respond ONLY with a valid JSON object — no markdown, no extra text.`

    userPrompt = `Transform this goal into a structured OKR:
Goal: "${goal}"

Respond with ONLY this JSON structure:
{
  "objective": "A single clear, inspiring objective sentence",
  "why": "One sentence on why this matters",
  "keyResults": [
    {
      "id": "kr1",
      "title": "Key Result title (verb + noun)",
      "description": "Brief description",
      "target": 100,
      "unit": "unit of measurement (e.g. users, hours, $, interviews, pages)",
      "category": "one of: build | acquire | learn | ship | revenue | health"
    }
  ]
}

Rules:
- 3 to 5 key results
- Each target must be a specific number
- Titles should be action-oriented (e.g. "Interview potential users", "Ship MVP")
- Categories help with visual display`
  }

  if (action === 'suggest_action') {
    systemPrompt = `You are a sharp, direct execution coach. No fluff.
Analyze goal progress and give one specific next action.
Be ultra-concrete. Name exact numbers. Respond ONLY with JSON.`

    userPrompt = `Goal: "${goal}"
Objective: "${keyResults?.objective}"

Progress on Key Results:
${progress?.map((kr: { title: string; current: number; target: number; unit: string }) =>
  `- ${kr.title}: ${kr.current}/${kr.target} ${kr.unit} (${Math.round((kr.current/kr.target)*100)}% done)`
).join('\n')}

Respond with ONLY this JSON:
{
  "action": "One specific, actionable next step (1-2 sentences max)",
  "urgency": "high | medium | low",
  "focusKr": "id of the key result to focus on (kr1, kr2, etc.)"
}`
  }

  try {
    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [{ role: 'system', content: systemPrompt }, { role: 'user', content: userPrompt }],
        max_tokens: 600,
        temperature: 0.7,
        response_format: { type: 'json_object' },
      }),
    })
    const data = await res.json()
    const content = data.choices?.[0]?.message?.content || '{}'
    return NextResponse.json(JSON.parse(content))
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'AI request failed' }, { status: 500 })
  }
}
