'use client'

import { useApp } from '../AppContext'
import { CORE_TASKS, QUOTES, DAYS, MONTHS } from '@/types'
import { useCallback } from 'react'
import { PageHeader }  from '../ui/page-header'
import { Card, CardHeader, CardContent, CardTitle } from '../ui/card'
import { Progress, progressHex } from '../ui/progress'
import { Checkbox }    from '../ui/checkbox'
import { Badge }       from '../ui/badge'
import { Input }       from '../ui/input'
import { cn }          from '@/lib/utils'

function getQuote(dateKey: string) {
  const hash = dateKey.split('').reduce((a, c) => a + c.charCodeAt(0), 0)
  return QUOTES[hash % QUOTES.length]
}

// SVG completion ring — clean, no inline style pollution
function CompletionRing({ pct, done, total }: { pct: number; done: number; total: number }) {
  const r = 34, circ = 2 * Math.PI * r
  return (
    <div className="relative inline-flex items-center justify-center w-[88px] h-[88px]">
      <svg width={88} height={88} className="-rotate-90">
        <circle cx={44} cy={44} r={r} fill="none" stroke="#e8e5de" strokeWidth={4} />
        <circle
          cx={44} cy={44} r={r} fill="none"
          stroke={progressHex(pct)}
          strokeWidth={4} strokeLinecap="round"
          strokeDasharray={`${(pct / 100) * circ} ${circ}`}
          className="transition-all duration-700 ease-smooth"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-display font-bold text-base text-ink leading-none">{pct}%</span>
        <span className="font-mono text-2xs text-fog mt-0.5">{done}/{total}</span>
      </div>
    </div>
  )
}

export default function TodayPage() {
  const { today, saveDay, setPage } = useApp()
  const now   = new Date()
  const TODAY = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')}`
  const quote = getQuote(TODAY)
  const hour  = now.getHours()

  const isEvening   = hour >= 18 || hour < 5
  const greeting    = hour < 5 ? 'Still going.' : hour < 12 ? 'Good morning.' : hour < 17 ? 'Good afternoon.' : 'Good evening.'
  const tasksDone   = Object.values(today.tasks || {}).filter(Boolean).length
  const tasksPct    = Math.round((tasksDone / CORE_TASKS.length) * 100)
  const allDone     = tasksDone === CORE_TASKS.length

  const reflectionFields = ['ref_thought','ref_went_well','ref_big_win','ref_learned','ref_tomorrow','ref_gratitude'] as const
  const reflectionDone   = reflectionFields.filter(f => today[f]).length

  const handleFocus = useCallback(
    (field: 'focus1' | 'focus2' | 'focus3', val: string) => saveDay({ [field]: val }),
    [saveDay]
  )

  return (
    <div className="animate-fade-up">
      <PageHeader
        title={greeting}
        subtitle={`${DAYS[now.getDay()]}, ${MONTHS[now.getMonth()]} ${now.getDate()} · ${now.getFullYear()}`}
        below={<Progress value={tasksPct} color="dynamic" />}
      >
        {allDone && <Badge variant="success">✓ All complete</Badge>}
        <CompletionRing pct={tasksPct} done={tasksDone} total={CORE_TASKS.length} />
      </PageHeader>

      <div className="px-14 pt-9 pb-14 max-w-[860px] flex flex-col gap-6">

        {/* ── Disciplines ── */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-0">
            <CardTitle>Disciplines</CardTitle>
            <span className={cn(
              'font-mono text-2xs tracking-widest transition-colors duration-300',
              allDone ? 'text-success' : 'text-fog'
            )}>
              {allDone ? '✓ Complete' : `${tasksDone} of ${CORE_TASKS.length} done`}
            </span>
          </CardHeader>
          <CardContent className="pt-2">
            {CORE_TASKS.map((task, i) => {
              const done = !!(today.tasks?.[task.id])
              return (
                <button
                  key={task.id}
                  onClick={() => saveDay({ tasks: { ...today.tasks, [task.id]: !done } })}
                  className={cn(
                    'w-full flex items-center gap-4 py-3.5 min-h-[52px]',
                    'border-b border-paper-3 last:border-none',
                    'transition-all duration-150 cursor-pointer select-none group',
                    'hover:pl-1 focus-visible:outline-none focus-visible:pl-1',
                  )}
                  style={{
                    animationDelay: `${i * 40}ms`,
                  }}
                >
                  <Checkbox checked={done} />
                  <span className={cn(
                    'flex-1 font-sans text-sm text-left transition-all duration-200',
                    done ? 'text-fog line-through' : 'text-ink font-medium'
                  )}>
                    {task.name}
                  </span>
                  {done && (
                    <span className="font-mono text-2xs text-fog tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">
                      Done
                    </span>
                  )}
                </button>
              )
            })}
          </CardContent>
        </Card>

        {/* ── Today's Focus ── */}
        <Card>
          <CardHeader>
            <CardTitle>Today's Focus</CardTitle>
            <p className="font-mono text-2xs text-fog/80 mt-1">Three areas to move 1% forward</p>
          </CardHeader>
          <CardContent className="pt-2">
            <div className="flex flex-col gap-4">
              {(['focus1', 'focus2', 'focus3'] as const).map((field, i) => (
                <div key={field} className="flex items-center gap-4">
                  <div className="w-[22px] h-[22px] rounded-full border border-smoke flex items-center justify-center flex-shrink-0">
                    <span className="font-mono text-2xs text-fog">{i + 1}</span>
                  </div>
                  <Input
                    defaultValue={today[field] || ''}
                    placeholder={[
                      'One thing to move forward today...',
                      'A skill or habit to sharpen...',
                      'One thing to avoid or cut...',
                    ][i]}
                    onBlur={e => handleFocus(field, e.target.value)}
                  />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* ── Two-col: Hydration + Quote ── */}
        <div className="grid grid-cols-2 gap-6">

          {/* Hydration */}
          <Card>
            <CardHeader className="flex flex-row items-start justify-between pb-0">
              <div>
                <CardTitle>Hydration</CardTitle>
                <div className="mt-1.5 font-display font-bold text-2xl text-ink leading-none">
                  {today.water || 0}
                  <span className="font-mono text-xs text-fog ml-1.5 font-normal">/ 12</span>
                </div>
              </div>
              {(today.water || 0) >= 12 && <Badge variant="success">Goal ✓</Badge>}
            </CardHeader>
            <CardContent className="pt-5">
              <div className="flex gap-1.5 flex-wrap">
                {Array.from({ length: 12 }).map((_, i) => {
                  const filled = i < (today.water || 0)
                  return (
                    <button
                      key={i}
                      onClick={() => saveDay({ water: i < (today.water || 0) ? i : i + 1 })}
                      className={cn(
                        'w-[26px] h-[34px] border rounded-b-md cursor-pointer',
                        'transition-all duration-150 ease-spring',
                        filled
                          ? 'bg-ink border-ink'
                          : 'bg-transparent border-smoke hover:border-ash hover:scale-110'
                      )}
                    />
                  )
                })}
              </div>
            </CardContent>
          </Card>

          {/* Quote */}
          <div className="border-l-[3px] border-ink bg-pure-white px-6 py-5 flex flex-col justify-center shadow-card rounded-r-sm">
            <p className="font-mono text-2xs tracking-widest uppercase text-fog mb-3">Today's Wisdom</p>
            <blockquote className="font-display italic text-base text-ink leading-[1.75]">
              {quote.text}
            </blockquote>
            <p className="font-mono text-xs text-ash mt-3">— {quote.author}</p>
          </div>
        </div>

        {/* ── Evening Reflection CTA ── */}
        <button
          onClick={() => setPage('reflection')}
          className={cn(
            'w-full flex items-center justify-between px-5 py-4',
            'border rounded-sm transition-all duration-200 cursor-pointer group',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink',
            isEvening
              ? 'bg-ink border-ink text-paper hover:bg-ink-2'
              : 'bg-transparent border-paper-3 hover:bg-pure-white hover:border-smoke'
          )}
        >
          <div className="text-left">
            <p className={cn(
              'font-sans text-sm font-medium',
              isEvening ? 'text-paper' : 'text-ink'
            )}>
              {isEvening ? 'Time for your evening reflection' : 'Evening Reflection'}
            </p>
            <p className={cn(
              'font-mono text-2xs tracking-wide mt-0.5',
              isEvening ? 'text-paper/50' : 'text-fog'
            )}>
              {reflectionDone > 0 ? `${reflectionDone} of 6 fields filled` : 'End your day with intention'}
            </p>
          </div>
          <span className={cn(
            'font-mono text-sm transition-transform duration-150 group-hover:translate-x-0.5',
            isEvening ? 'text-paper/60' : 'text-fog'
          )}>
            →
          </span>
        </button>

      </div>
    </div>
  )
}
