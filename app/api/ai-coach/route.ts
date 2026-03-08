import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

const SYSTEM = `You are a Stoic life coach — disciplined, clear, and direct.
Draw on Marcus Aurelius, Epictetus, Seneca, and modern high-performance principles.
Keep responses concise (3–5 sentences), actionable, and grounded.
No emojis. No fluff. Speak with quiet authority.`

// In-memory rate limiter: 10 requests per minute per user
// For production, replace with Upstash Redis or similar
const rateLimitMap = new Map<string, { count: number; resetAt: number }>()

function checkRateLimit(userId: string): boolean {
  const now = Date.now()
  const entry = rateLimitMap.get(userId)
  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(userId, { count: 1, resetAt: now + 60_000 })
    return true
  }
  if (entry.count >= 10) return false
  entry.count++
  return true
}

export async function POST(req: NextRequest) {
  // Auth check — must be a logged-in user
  const cookieStore = cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => cookieStore.getAll() } }
  )
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Rate limit
  if (!checkRateLimit(user.id)) {
    return NextResponse.json({ error: 'Too many requests. Please wait a moment.' }, { status: 429 })
  }

  const { message } = await req.json()
  if (!message) return NextResponse.json({ error: 'No message' }, { status: 400 })

  // Input length cap
  if (typeof message !== 'string' || message.length > 500) {
    return NextResponse.json({ error: 'Message must be 500 characters or fewer.' }, { status: 400 })
  }

  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) {
    return NextResponse.json({
      reply: 'The AI Coach requires an OpenAI API key. Add OPENAI_API_KEY to your .env.local file.',
    })
  }

  try {
    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: SYSTEM },
          { role: 'user', content: message },
        ],
        max_tokens: 300,
        temperature: 0.7,
      }),
    })

    const data = await res.json()
    const reply = data.choices?.[0]?.message?.content || 'No response.'
    return NextResponse.json({ reply })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ reply: 'An error occurred. Please try again.' })
  }
}
