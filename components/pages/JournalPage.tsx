'use client'

import { useApp } from '../AppContext'
import { useRef } from 'react'
import { PageHeader } from '../ui/page-header'
import { Card, CardHeader, CardContent, CardTitle } from '../ui/card'
import { Badge } from '../ui/badge'
import { cn } from '@/lib/utils'

export default function JournalPage() {
  const { today, saveDay } = useApp()
  const mainRef   = useRef<HTMLTextAreaElement>(null)
  const saveTimer = useRef<NodeJS.Timeout | null>(null)
  const now       = new Date()
  const hour      = now.getHours()
  const timeCtx   = hour < 12 ? 'Morning pages' : hour < 17 ? 'Afternoon reflection' : 'Evening pages'
  const wordCount = (today.journal_main || '').trim().split(/\s+/).filter(Boolean).length

  function handleMain(val: string) {
    if (saveTimer.current) clearTimeout(saveTimer.current)
    saveTimer.current = setTimeout(() => saveDay({ journal_main: val }), 800)
  }

  return (
    <div className="animate-fade-up">
      <PageHeader
        title="Journal"
        subtitle={`${timeCtx} · No filters, no judgment`}
      >
        {wordCount > 0 && (
          <Badge variant="muted">{wordCount} words</Badge>
        )}
      </PageHeader>

      <div className="px-14 pt-9 pb-14 max-w-[800px]">
        <Card>
          <CardContent className="pt-6">
            <textarea
              ref={mainRef}
              defaultValue={today.journal_main || ''}
              placeholder="Begin writing. The page is yours..."
              onInput={e => {
                const ta = e.currentTarget
                ta.style.height = 'auto'
                ta.style.height = ta.scrollHeight + 'px'
              }}
              onBlur={e => handleMain(e.target.value)}
              className={cn(
                'w-full bg-transparent border-0 outline-none resize-none',
                'text-sm text-ink leading-[2] min-h-[320px]',
                'placeholder:text-fog focus:outline-none'
              )}
              style={{ fontFamily: "'Times New Roman', Times, serif" }}
            />
            <div className="mt-3 flex justify-end border-t border-paper-3 pt-3">
              <span className="font-mono text-2xs text-fog tracking-widest">
                {wordCount} {wordCount === 1 ? 'word' : 'words'}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Intentions — kept but slimmed down */}
        <div className="mt-5">
          <Card>
            <CardHeader><CardTitle>Daily Intentions</CardTitle></CardHeader>
            <CardContent>
              <textarea
                defaultValue={today.journal_intentions || ''}
                placeholder="What I intend to achieve, feel, and embody today..."
                rows={3}
                onBlur={e => saveDay({ journal_intentions: e.target.value })}
                className="w-full bg-transparent border-0 border-b border-smoke outline-none resize-none text-sm text-ink leading-[1.9] placeholder:text-fog focus:border-ink transition-colors"
              />
            </CardContent>
          </Card>
        </div>

        <div className="mt-5">
          <Card>
            <CardHeader><CardTitle>Stoic Reflection</CardTitle></CardHeader>
            <CardContent>
              <textarea
                defaultValue={today.journal_stoic || ''}
                placeholder="How can I apply Stoic principles today..."
                rows={3}
                onBlur={e => saveDay({ journal_stoic: e.target.value })}
                className="w-full bg-transparent border-0 border-b border-smoke outline-none resize-none text-sm text-ink leading-[1.9] placeholder:text-fog focus:border-ink transition-colors"
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
