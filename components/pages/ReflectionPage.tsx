'use client'

import { useApp } from '../AppContext'
import { PageHeader }  from '../ui/page-header'
import { Card, CardHeader, CardContent, CardTitle } from '../ui/card'

import { cn }          from '@/lib/utils'

const REFLECTION_FIELDS = [
  { key: 'ref_thought',   label: "Today's Thought",     placeholder: 'One thought that defined today...',         wide: true  },
  { key: 'ref_went_well', label: 'What Went Well',       placeholder: 'Three things that went well today...',      wide: false },
  { key: 'ref_big_win',   label: "Today's #1 Win",       placeholder: 'My biggest win today was...',               wide: false },
  { key: 'ref_learned',   label: 'What I Learned',       placeholder: 'The most important thing I learned...',     wide: false },
  { key: 'ref_tomorrow',  label: "Tomorrow's Intention", placeholder: 'Tomorrow I will focus on...',               wide: false },
  { key: 'ref_gratitude', label: 'Gratitude',            placeholder: 'I am grateful for...',                      wide: false },
] as const

export default function ReflectionPage() {
  const { today, saveDay } = useApp()
  const now     = new Date()
  const hour    = now.getHours()
  const isGood  = hour >= 18 || hour < 2

  const filled  = REFLECTION_FIELDS.filter(f => today[f.key]).length
  const pct     = Math.round((filled / REFLECTION_FIELDS.length) * 100)
  const isDone  = filled === REFLECTION_FIELDS.length

  return (
    <div className="animate-fade-up">
      <PageHeader
        title="Evening Reflection"
        subtitle={isGood ? 'Good time to reflect — end your day with intention' : 'Best completed after 8pm · Available anytime'}

      >
        <div className="text-right">
          <div className={cn(
            'font-display font-bold text-3xl leading-none transition-colors duration-300',
            isDone ? 'text-success' : 'text-ink'
          )}>
            {filled}/6
          </div>
          <div className="font-mono text-2xs text-fog mt-0.5 tracking-widest">
            {isDone ? '✓ Complete' : 'fields filled'}
          </div>
        </div>
      </PageHeader>

      <div className="px-14 pt-9 pb-14 max-w-[860px]">

        {/* First field — full width */}
        <Card className="mb-5">
          <CardHeader className="flex flex-row items-center justify-between pb-0">
            <CardTitle>{REFLECTION_FIELDS[0].label}</CardTitle>
            {today[REFLECTION_FIELDS[0].key] && (
              <span className="w-1.5 h-1.5 rounded-full inline-block bg-success" />
            )}
          </CardHeader>
          <CardContent className="pt-3">
            <textarea
              rows={4}
              defaultValue={today[REFLECTION_FIELDS[0].key] || ''}
              placeholder={REFLECTION_FIELDS[0].placeholder}
              onBlur={e => saveDay({ [REFLECTION_FIELDS[0].key]: e.target.value } as Parameters<typeof saveDay>[0])}
              className="w-full bg-transparent border-0 border-b border-smoke outline-none resize-none text-sm text-ink leading-[1.9] placeholder:text-fog focus:border-ink transition-colors"
              style={{ fontFamily: "'Times New Roman', Times, serif" }}
            />
          </CardContent>
        </Card>

        {/* 2-column grid for the rest */}
        <div className="grid grid-cols-2 gap-5">
          {REFLECTION_FIELDS.slice(1).map(({ key, label, placeholder }) => (
            <Card key={key}>
              <CardHeader className="flex flex-row items-center justify-between pb-0">
                <CardTitle>{label}</CardTitle>
                {today[key] && (
                  <span className="w-1.5 h-1.5 rounded-full inline-block flex-shrink-0 bg-success" />
                )}
              </CardHeader>
              <CardContent className="pt-3">
                <textarea
                  rows={3}
                  defaultValue={today[key] || ''}
                  placeholder={placeholder}
                  onBlur={e => saveDay({ [key]: e.target.value } as Parameters<typeof saveDay>[0])}
                  className="w-full bg-transparent border-0 border-b border-smoke outline-none resize-none text-sm text-ink leading-[1.9] placeholder:text-fog focus:border-ink transition-colors"
                />
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Completion state */}
        {isDone && (
          <div className="mt-7 px-6 py-5 border border-success-border rounded-sm bg-success-bg animate-fade-in">
            <p className="font-display italic text-base text-success leading-relaxed">
              Day complete. Another 1% better.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
