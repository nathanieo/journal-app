'use client'

import { useApp } from '../AppContext'
import { CORE_TASKS } from '@/types'
import { useMemo } from 'react'
import { PageHeader }  from '../ui/page-header'
import { Card, CardHeader, CardContent, CardTitle } from '../ui/card'
import { Progress, progressHex }    from '../ui/progress'
import { cn }          from '@/lib/utils'

export default function DashboardPage() {
  const { allDays, streak } = useApp()

  const stats = useMemo(() => {
    const keys = Object.keys(allDays).sort()
    const totalDays = keys.length
    const perfectDays = keys.filter(k =>
      Object.values(allDays[k].tasks || {}).filter(Boolean).length >= CORE_TASKS.length
    ).length
    const journaledDays = keys.filter(k => allDays[k].journal_main).length
    const avgCompletion = totalDays
      ? Math.round(keys.reduce((sum, k) => {
          return sum + (Object.values(allDays[k].tasks || {}).filter(Boolean).length / CORE_TASKS.length) * 100
        }, 0) / totalDays)
      : 0
    return { totalDays, perfectDays, journaledDays, avgCompletion }
  }, [allDays])

  const last60 = useMemo(() => {
    return Array.from({ length: 60 }, (_, i) => {
      const d = new Date(); d.setDate(d.getDate() - (59 - i))
      const key = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`
      const entry = allDays[key]
      const done  = entry ? Object.values(entry.tasks || {}).filter(Boolean).length : 0
      return { key, pct: done / CORE_TASKS.length }
    })
  }, [allDays])

  const insight = useMemo(() => {
    if (stats.totalDays === 0) return 'Start logging to see your patterns.'
    if (streak >= 30) return `${streak} days unbroken. You are ${stats.avgCompletion}% consistent.`
    if (stats.avgCompletion >= 80) return `Strong — ${stats.avgCompletion}% average completion across ${stats.totalDays} days.`
    if (stats.perfectDays > 0) return `${stats.perfectDays} perfect days out of ${stats.totalDays}. Keep stacking them.`
    return `${stats.totalDays} days logged. ${stats.avgCompletion}% avg completion. Keep showing up.`
  }, [stats, streak])

  const STAT_ITEMS = [
    { label: 'Day Streak',     value: streak,                    hi: streak >= 7 },
    { label: 'Avg Completion', value: `${stats.avgCompletion}%`, hi: stats.avgCompletion >= 80 },
    { label: 'Perfect Days',   value: stats.perfectDays,         hi: false },
    { label: 'Days Journaled', value: stats.journaledDays,       hi: false },
    { label: 'Total Logged',   value: stats.totalDays,           hi: false },
  ]

  const todayKey = new Date().toISOString().split('T')[0]

  return (
    <div className="animate-fade-up">
      <PageHeader title="Dashboard" subtitle="Your Consistency Record" />

      <div className="px-14 pt-9 pb-14">

        {/* Insight narrative */}
        <p className="font-display italic text-lg text-ash mb-8 leading-relaxed">{insight}</p>

        {/* Stats row */}
        <div className="grid grid-cols-5 gap-4 mb-9">
          {STAT_ITEMS.map(({ label, value, hi }) => (
            <Card
              key={label}
              className={cn('p-6', hi && 'border-ink')}
            >
              <div className={cn(
                'font-display font-bold text-4xl leading-none',
                hi ? 'text-ink' : 'text-ink'
              )}>
                {value}
              </div>
              <div className="font-mono text-2xs tracking-widest uppercase text-fog mt-2">
                {label}
              </div>
            </Card>
          ))}
        </div>

        {/* 60-day heatmap */}
        <Card className="mb-5">
          <CardHeader className="flex flex-row items-center justify-between pb-0">
            <CardTitle>Last 60 Days</CardTitle>
            <div className="flex items-center gap-2.5">
              <span className="font-mono text-2xs text-fog">Less</span>
              {[0, 15, 45, 75, 100].map(v => (
                <div
                  key={v}
                  className="w-2.5 h-2.5 rounded-sm"
                  style={{ background: v === 0 ? '#e8e5de' : progressHex(v) }}
                />
              ))}
              <span className="font-mono text-2xs text-fog">More</span>
            </div>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="flex gap-1 flex-wrap">
              {last60.map(({ key, pct }) => {
                const isToday = key === todayKey
                return (
                  <div
                    key={key}
                    title={`${key} · ${Math.round(pct * 100)}%`}
                    className={cn(
                      'w-[22px] h-[22px] rounded-sm cursor-default',
                      'transition-transform duration-100 hover:scale-125',
                      isToday && 'ring-2 ring-ink ring-offset-1'
                    )}
                    style={{
                      background: pct === 0 ? '#e8e5de' : progressHex(Math.round(pct * 100)),
                      flexShrink: 0,
                    }}
                  />
                )
              })}
            </div>
          </CardContent>
        </Card>

        {/* Per-task rates */}
        <Card>
          <CardHeader>
            <CardTitle>Discipline Consistency</CardTitle>
          </CardHeader>
          <CardContent className="pt-2">
            <div className="flex flex-col gap-4">
              {CORE_TASKS.map(task => {
                const total = Object.keys(allDays).length
                const done  = Object.values(allDays).filter(d => d.tasks?.[task.id]).length
                const rate  = total ? Math.round((done / total) * 100) : 0
                const isWeak= rate < 50 && total > 0
                const color = 'dynamic' as const

                return (
                  <div key={task.id} className="flex items-center gap-4">
                    <div className={cn(
                      'w-28 font-sans text-sm flex-shrink-0',
                      isWeak ? 'text-fog' : 'text-ink'
                    )}>
                      {task.name}
                    </div>
                    <Progress value={rate} color={color} thickness="thick" className="flex-1" />
                    <div className={cn(
                      'w-9 text-right font-mono text-xs flex-shrink-0',
                      isWeak ? 'text-fog' : 'text-ash'
                    )}>
                      {rate}%
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>

      </div>
    </div>
  )
}
