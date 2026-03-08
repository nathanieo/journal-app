'use client'

import { useApp } from './AppContext'
import { PageName, MONTHS } from '@/types'
import { useState, useEffect } from 'react'
import { cn } from '@/lib/utils'

const NAV_GROUPS = [
  {
    label: 'Daily',
    items: [
      { id: 'today',      label: 'Today'       },
      { id: 'journal',    label: 'Journal'     },
      { id: 'reflection', label: 'Reflection'  },
      { id: 'tasks',      label: 'Disciplines' },
    ],
  },
  {
    label: 'Build',
    items: [
      { id: 'goals',     label: 'Goals'     },
      { id: 'okr',       label: 'OKR Goals' },
      { id: 'entries',   label: 'Notebooks' },
      { id: 'dashboard', label: 'Dashboard' },
      { id: 'calendar',  label: 'Calendar'  },
    ],
  },
  {
    label: 'Tools',
    items: [
      { id: 'workout',  label: 'Workout'  },
      { id: 'pomodoro', label: 'Focus'    },
      { id: 'ai',       label: 'AI Coach' },
    ],
  },
] as const

const MILESTONES = [7, 30, 75, 100, 200, 365]
const MILESTONE_LINES: Record<number, string> = {
  7:   'Seven days. The habit is forming.',
  30:  'Thirty days. The habit is becoming the person.',
  75:  'Seventy-five days. Most people quit. You didn\'t.',
  100: 'One hundred days. You are no longer who you were.',
  200: 'Two hundred days. Discipline made permanent.',
  365: 'One year. You have become the proof.',
}

export default function Sidebar() {
  const { page, setPage, streak, saving } = useApp()
  const now = new Date()
  const [milestone, setMilestone] = useState<number | null>(null)
  const [shownMilestones, setShownMilestones] = useState<number[]>([])

  useEffect(() => {
    if (!streak || shownMilestones.includes(streak)) return
    if (MILESTONES.includes(streak)) {
      setMilestone(streak)
      setShownMilestones(prev => [...prev, streak])
    }
  }, [streak])

  return (
    <>
      {/* ── Streak milestone overlay ── */}
      {milestone && (
        <div className="milestone-overlay" onClick={() => setMilestone(null)}>
          <p className="font-mono text-2xs tracking-widest uppercase text-white/30 mb-8">
            Day Streak
          </p>
          <span
            className="font-display font-bold text-white leading-none"
            style={{ fontSize: 'clamp(5rem, 18vw, 12rem)', letterSpacing: '-0.04em' }}
          >
            {milestone}
          </span>
          <p className="font-display italic text-white/60 text-xl mt-9 max-w-sm text-center leading-relaxed">
            {MILESTONE_LINES[milestone]}
          </p>
          <p className="font-mono text-2xs tracking-widest uppercase text-white/20 mt-14">
            Tap to continue
          </p>
        </div>
      )}

      {/* ── Sidebar shell ── */}
      <nav className="fixed inset-y-0 left-0 w-[220px] bg-ink flex flex-col z-50 border-r border-ink-3">

        {/* Logo */}
        <div className="px-5 pt-7 pb-5 border-b border-white/[0.07]">
          <div className="font-display font-bold text-paper text-lg leading-tight tracking-tight">
            1% Journal
          </div>
          <div className="font-mono text-2xs text-white/25 tracking-widest uppercase mt-1">
            Compound Yourself Daily
          </div>
        </div>

        {/* Date + streak pill */}
        <div className="px-5 py-4 border-b border-white/[0.06] flex items-end justify-between">
          <div>
            <div className="font-display font-bold text-paper text-3xl leading-none">
              {String(now.getDate()).padStart(2, '0')}
            </div>
            <div className="font-mono text-2xs text-white/35 tracking-widest uppercase mt-1">
              {MONTHS[now.getMonth()].slice(0, 3)} {now.getFullYear()}
            </div>
          </div>
          {streak > 0 && (
            <div className="text-right">
              <div className="font-display font-bold text-paper text-2xl leading-none">{streak}</div>
              <div className="font-mono text-2xs text-white/30 tracking-widest uppercase mt-0.5">
                streak
              </div>
            </div>
          )}
        </div>

        {/* Nav groups */}
        <div className="flex-1 overflow-y-auto py-1">
          {NAV_GROUPS.map((group, gi) => (
            <div key={group.label}>
              {gi > 0 && <div className="h-px bg-white/5 my-1.5" />}
              <p className="px-5 pt-4 pb-1.5 font-mono text-2xs tracking-widest uppercase text-white/20">
                {group.label}
              </p>
              {group.items.map(item => {
                const isActive = page === item.id
                return (
                  <button
                    key={item.id}
                    onClick={() => setPage(item.id as PageName)}
                    className={cn(
                      'w-full flex items-center gap-2.5 px-5 py-2.5',
                      'font-sans text-sm font-normal tracking-[0.01em]',
                      'border-l-2 transition-all duration-150 cursor-pointer',
                      'focus-visible:outline-none focus-visible:bg-white/10',
                      isActive
                        ? 'text-paper border-l-paper bg-white/[0.07] font-medium'
                        : 'text-white/45 border-l-transparent hover:text-paper/80 hover:bg-white/[0.04]'
                    )}
                  >
                    {item.label}
                  </button>
                )
              })}
            </div>
          ))}
        </div>

        {/* Save indicator */}
        <div className="px-5 py-4 border-t border-white/[0.05]">
          <p className={cn(
            'font-mono text-2xs tracking-widest uppercase transition-colors duration-500',
            saving ? 'text-white/50' : 'text-white/18'
          )}>
            {saving ? 'Saving...' : 'All saved'}
          </p>
        </div>
      </nav>
    </>
  )
}
