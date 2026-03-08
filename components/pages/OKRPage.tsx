'use client'

import { useState, useEffect, useCallback } from 'react'
import { cn } from '@/lib/utils'
import { Button } from '../ui/button'
import { Card, CardHeader, CardContent, CardTitle } from '../ui/card'
import { Input } from '../ui/input'
import { Progress, progressHex } from '../ui/progress'
import { Badge } from '../ui/badge'
import { PageHeader } from '../ui/page-header'

// ─── Types ───────────────────────────────────────────────────────
export interface KeyResult {
  id: string
  title: string
  description: string
  target: number
  current: number
  unit: string
  category: 'build' | 'acquire' | 'learn' | 'ship' | 'revenue' | 'health'
}

export interface OKRGoal {
  id: string
  rawGoal: string
  objective: string
  why: string
  keyResults: KeyResult[]
  suggestedAction?: string
  actionUrgency?: 'high' | 'medium' | 'low'
  actionFocusKr?: string
  createdAt: string
  updatedAt: string
}

// ─── Storage ─────────────────────────────────────────────────────
const STORAGE_KEY = 'okr_goals_v1'

function loadGoals(): OKRGoal[] {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]') } catch { return [] }
}
function saveGoals(goals: OKRGoal[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(goals))
}

// ─── Category config ─────────────────────────────────────────────
const CAT_COLORS: Record<string, string> = {
  build:   'bg-blue-50 text-blue-700 border-blue-200',
  acquire: 'bg-green-50 text-green-700 border-green-200',
  learn:   'bg-amber-50 text-amber-700 border-amber-200',
  ship:    'bg-purple-50 text-purple-700 border-purple-200',
  revenue: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  health:  'bg-rose-50 text-rose-700 border-rose-200',
}


// ─── Example goals for empty state ───────────────────────────────
const EXAMPLE_GOALS = [
  'Start a SaaS business',
  'Get in the best shape of my life',
  'Launch a content brand',
  'Learn to code and ship a product',
  'Build financial freedom',
]

// ─── Sub-components ───────────────────────────────────────────────

function KRProgressRow({
  kr, goalId, onUpdate, isFocus,
}: {
  kr: KeyResult; goalId: string; onUpdate: (goalId: string, krId: string, val: number) => void; isFocus: boolean
}) {
  const pct = Math.min(100, Math.round((kr.current / kr.target) * 100))
  const done = pct >= 100
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(String(kr.current))

  function commit() {
    const val = Math.min(kr.target, Math.max(0, Number(draft) || 0))
    onUpdate(goalId, kr.id, val)
    setEditing(false)
  }

  return (
    <div className={cn(
      'group rounded-sm border p-4 transition-all duration-200',
      isFocus ? 'border-ink bg-ink/[0.02]' : 'border-paper-3 bg-pure-white hover:border-smoke',
      done && 'border-success/30 bg-success/[0.02]'
    )}>
      <div className="flex items-start justify-between gap-4 mb-3">
        <div className="flex items-start gap-3 flex-1 min-w-0">
          {/* done indicator */}
          <div className={cn(
            'mt-0.5 w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all duration-300',
            done ? 'bg-success border-success' : isFocus ? 'border-ink' : 'border-smoke'
          )}>
            {done && (
              <svg viewBox="0 0 10 8" className="w-2.5 h-2 stroke-white stroke-[2.5] fill-none" strokeLinecap="round" strokeLinejoin="round">
                <path d="M1 4L3.5 6.5L9 1" />
              </svg>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <p className={cn('font-sans text-sm font-medium', done ? 'text-fog line-through' : 'text-ink')}>{kr.title}</p>
              {isFocus && !done && (
                <span className="font-mono text-2xs px-1.5 py-0.5 bg-ink text-paper rounded-sm tracking-widest uppercase">Focus</span>
              )}
              <span className={cn('font-mono text-2xs px-2 py-0.5 border rounded-sm tracking-widest uppercase', CAT_COLORS[kr.category] || 'bg-paper-3 text-fog border-paper-3')}>
                {kr.category}
              </span>
            </div>
            {kr.description && <p className="font-sans text-xs text-fog mt-0.5 leading-relaxed">{kr.description}</p>}
          </div>
        </div>

        {/* Inline edit */}
        <div className="flex-shrink-0 flex items-center gap-2">
          {editing ? (
            <div className="flex items-center gap-1.5">
              <input
                autoFocus
                type="number"
                value={draft}
                onChange={e => setDraft(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') commit(); if (e.key === 'Escape') setEditing(false) }}
                className="w-20 font-mono text-sm text-center bg-pure-white border border-ink rounded-sm px-2 py-1 outline-none"
              />
              <span className="font-mono text-2xs text-fog">/ {kr.target} {kr.unit}</span>
              <Button size="sm" onClick={commit}>✓</Button>
            </div>
          ) : (
            <button
              onClick={() => { setDraft(String(kr.current)); setEditing(true) }}
              className="text-right group-hover:opacity-100 transition-all"
            >
              <span className={cn('font-display font-bold text-xl leading-none', done ? 'text-success' : 'text-ink')}>{kr.current}</span>
              <span className="font-mono text-2xs text-fog ml-0.5">/{kr.target}</span>
              <p className="font-mono text-2xs text-fog uppercase tracking-widest mt-0.5">{kr.unit}</p>
            </button>
          )}
        </div>
      </div>

      <Progress
        value={pct}
        color={done ? 'success' : 'dynamic'}
        thickness="default"
      />

      <div className="flex items-center justify-between mt-1.5">
        <span className="font-mono text-2xs text-fog">{pct}% complete</span>
        {!done && !editing && (
          <button
            onClick={() => { setDraft(String(kr.current)); setEditing(true) }}
            className="font-mono text-2xs text-fog hover:text-ink transition-colors opacity-0 group-hover:opacity-100"
          >
            Update →
          </button>
        )}
        {done && <span className="font-mono text-2xs text-success tracking-widest">✓ Achieved</span>}
      </div>
    </div>
  )
}

function GoalDashboard({
  goal, onUpdate, onDelete, onRefreshAction,
}: {
  goal: OKRGoal
  onUpdate: (goalId: string, krId: string, val: number) => void
  onDelete: (id: string) => void
  onRefreshAction: (goal: OKRGoal) => void
}) {
  const [loadingAction, setLoadingAction] = useState(false)
  const [expanded, setExpanded] = useState(true)

  const totalPct = Math.round(
    goal.keyResults.reduce((sum, kr) => sum + Math.min(100, (kr.current / kr.target) * 100), 0) /
    Math.max(1, goal.keyResults.length)
  )
  const completedKRs = goal.keyResults.filter(kr => kr.current >= kr.target).length
  const overallDone = totalPct >= 100

  async function handleRefreshAction() {
    setLoadingAction(true)
    await onRefreshAction(goal)
    setLoadingAction(false)
  }

  return (
    <div className={cn(
      'rounded-sm border transition-all duration-300',
      overallDone ? 'border-success/40 bg-success/[0.015]' : 'border-paper-3 bg-pure-white'
    )}>
      {/* Goal header */}
      <div
        className="px-6 py-5 flex items-start gap-4 cursor-pointer select-none"
        onClick={() => setExpanded(e => !e)}
      >
        {/* Big progress ring */}
        <div className="relative flex-shrink-0 w-14 h-14">
          <svg viewBox="0 0 56 56" className="-rotate-90 w-14 h-14">
            <circle cx={28} cy={28} r={24} fill="none" stroke="#e8e5de" strokeWidth={3.5} />
            <circle
              cx={28} cy={28} r={24} fill="none"
              stroke={progressHex(totalPct)}
              strokeWidth={3.5}
              strokeLinecap="round"
              strokeDasharray={2 * Math.PI * 24}
              strokeDashoffset={2 * Math.PI * 24 * (1 - totalPct / 100)}
              style={{ transition: 'stroke-dashoffset 0.6s ease' }}
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className={cn('font-mono font-bold text-xs', overallDone ? 'text-success' : 'text-ink')}>{totalPct}%</span>
          </div>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-0.5">
            <span className="font-mono text-2xs text-fog uppercase tracking-widest">Objective</span>
            <span className="font-mono text-2xs text-fog">·</span>
            <span className="font-mono text-2xs text-fog">{completedKRs}/{goal.keyResults.length} key results</span>
            {overallDone && (
              <span className="font-mono text-2xs px-2 py-0.5 bg-success text-white rounded-sm tracking-widest uppercase">Complete</span>
            )}
          </div>
          <p className="font-display font-bold text-lg text-ink leading-tight">{goal.objective}</p>
          <p className="font-sans text-sm text-ash mt-1 leading-relaxed">{goal.why}</p>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            onClick={e => { e.stopPropagation(); onDelete(goal.id) }}
            className="opacity-0 group-hover:opacity-100 font-mono text-2xs text-smoke hover:text-red-500 transition-all px-2 py-1 border border-transparent hover:border-red-200 rounded-sm"
          >
            Delete
          </button>
          <span className={cn('font-mono text-2xs text-fog transition-transform duration-200', !expanded && '-rotate-90')}>▼</span>
        </div>
      </div>

      {expanded && (
        <div className="px-6 pb-6">
          {/* AI Action suggestion */}
          {goal.suggestedAction && (
            <div className="mb-5 flex items-start gap-4 px-5 py-4 bg-ink/[0.03] border-l-[3px] border-ink rounded-sm">
              <div className="flex-shrink-0 mt-0.5 w-6 h-6 rounded-full bg-ink flex items-center justify-center">
                <svg viewBox="0 0 12 12" className="w-3 h-3 fill-paper">
                  <path d="M6 1C3.24 1 1 3.24 1 6s2.24 5 5 5 5-2.24 5-5-2.24-5-5-5zm.5 7.5h-1v-4h1v4zm0-5h-1V2.5h1V3.5z"/>
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-mono text-2xs tracking-widest uppercase text-fog mb-1.5">Suggested Next Action</p>
                <p className="font-sans text-sm text-ink leading-relaxed">{goal.suggestedAction}</p>
              </div>
              <button
                onClick={handleRefreshAction}
                disabled={loadingAction}
                className="flex-shrink-0 font-mono text-2xs text-fog hover:text-ink transition-colors disabled:opacity-30 mt-0.5"
                title="Refresh suggestion"
              >
                {loadingAction ? '...' : '↺'}
              </button>
            </div>
          )}

          {/* Key Results */}
          <div className="flex flex-col gap-3 mb-4">
            {goal.keyResults.map(kr => (
              <KRProgressRow
                key={kr.id}
                kr={kr}
                goalId={goal.id}
                onUpdate={onUpdate}
                isFocus={kr.id === goal.actionFocusKr}
              />
            ))}
          </div>

          {/* Bottom actions */}
          <div className="flex items-center gap-3 pt-3 border-t border-paper-3">
            <Button
              variant="ghost" size="sm"
              onClick={handleRefreshAction}
              loading={loadingAction}
            >
              Refresh AI Action
            </Button>
            <span className="font-mono text-2xs text-smoke">
              Created {new Date(goal.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
            </span>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Main page ─────────────────────────────────────────────────────
export default function OKRPage() {
  const [goals, setGoals] = useState<OKRGoal[]>([])
  const [input, setInput] = useState('')
  const [generating, setGenerating] = useState(false)
  const [error, setError] = useState('')
  const [activeExample, setActiveExample] = useState<number | null>(null)

  useEffect(() => { setGoals(loadGoals()) }, [])

  async function handleGenerate() {
    const raw = input.trim()
    if (!raw || generating) return
    setGenerating(true)
    setError('')

    try {
      const res = await fetch('/api/okr', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'generate_okr', goal: raw }),
      })
      const data = await res.json()

      if (!data.objective || !data.keyResults) {
        setError('Could not generate OKRs. Please try again with a more specific goal.')
        return
      }

      const newGoal: OKRGoal = {
        id: Date.now().toString(),
        rawGoal: raw,
        objective: data.objective,
        why: data.why || '',
        keyResults: (data.keyResults || []).map((kr: Omit<KeyResult, 'current'>) => ({ ...kr, current: 0 })),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }

      // Auto-fetch first action suggestion
      const actionRes = await fetch('/api/okr', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'suggest_action',
          goal: raw,
          keyResults: { objective: data.objective },
          progress: newGoal.keyResults.map(kr => ({ title: kr.title, current: 0, target: kr.target, unit: kr.unit })),
        }),
      })
      const actionData = await actionRes.json()
      if (actionData.action) {
        newGoal.suggestedAction = actionData.action
        newGoal.actionUrgency = actionData.urgency || 'medium'
        newGoal.actionFocusKr = actionData.focusKr
      }

      const updated = [newGoal, ...goals]
      setGoals(updated)
      saveGoals(updated)
      setInput('')
    } catch {
      setError('Something went wrong. Check your API key in .env.local.')
    } finally {
      setGenerating(false)
    }
  }

  function handleUpdateKR(goalId: string, krId: string, val: number) {
    const updated = goals.map(g => {
      if (g.id !== goalId) return g
      return {
        ...g,
        keyResults: g.keyResults.map(kr => kr.id === krId ? { ...kr, current: val } : kr),
        updatedAt: new Date().toISOString(),
      }
    })
    setGoals(updated)
    saveGoals(updated)
  }

  function handleDelete(id: string) {
    const updated = goals.filter(g => g.id !== id)
    setGoals(updated)
    saveGoals(updated)
  }

  async function handleRefreshAction(goal: OKRGoal) {
    try {
      const res = await fetch('/api/okr', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'suggest_action',
          goal: goal.rawGoal,
          keyResults: { objective: goal.objective },
          progress: goal.keyResults.map(kr => ({ title: kr.title, current: kr.current, target: kr.target, unit: kr.unit })),
        }),
      })
      const data = await res.json()
      if (data.action) {
        const updated = goals.map(g =>
          g.id === goal.id
            ? { ...g, suggestedAction: data.action, actionUrgency: data.urgency || 'medium', actionFocusKr: data.focusKr, updatedAt: new Date().toISOString() }
            : g
        )
        setGoals(updated)
        saveGoals(updated)
      }
    } catch {}
  }

  // Stats
  const totalKRs = goals.flatMap(g => g.keyResults)
  const completedKRs = totalKRs.filter(kr => kr.current >= kr.target).length
  const avgProgress = totalKRs.length
    ? Math.round(totalKRs.reduce((s, kr) => s + Math.min(100, (kr.current / kr.target) * 100), 0) / totalKRs.length)
    : 0

  return (
    <div className="animate-fade-up">
      <PageHeader title="OKR Goals" subtitle="Objectives & Key Results — AI-Powered Accountability" />

      <div className="px-14 pt-8 pb-16 max-w-4xl">

        {/* Stats bar — only shown when goals exist */}
        {goals.length > 0 && (
          <div className="grid grid-cols-3 gap-4 mb-8 animate-fade-in">
            {[
              { label: 'Active Goals', value: goals.length },
              { label: 'Key Results Done', value: `${completedKRs}/${totalKRs.length}` },
              { label: 'Avg. Progress', value: `${avgProgress}%` },
            ].map(stat => (
              <Card key={stat.label} className="!py-0">
                <div className="px-5 py-4">
                  <p className="font-mono text-2xs tracking-widest uppercase text-fog mb-1">{stat.label}</p>
                  <p className="font-display font-bold text-3xl text-ink leading-none">{stat.value}</p>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Goal input */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>New Goal</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="font-sans text-sm text-ash mb-4 leading-relaxed">
              Describe a goal in plain language. The AI will convert it into a measurable Objective with Key Results.
            </p>

            {/* Example prompts */}
            <div className="flex flex-wrap gap-2 mb-4">
              {EXAMPLE_GOALS.map((eg, i) => (
                <button
                  key={i}
                  onClick={() => { setInput(eg); setActiveExample(i) }}
                  className={cn(
                    'font-mono text-2xs px-3 py-1.5 border rounded-sm cursor-pointer transition-all duration-150 tracking-wide',
                    activeExample === i && input === eg
                      ? 'bg-ink text-paper border-ink'
                      : 'bg-transparent text-fog border-smoke hover:border-ink hover:text-ink'
                  )}
                >
                  {eg}
                </button>
              ))}
            </div>

            <div className="flex gap-3">
              <Input
                value={input}
                onChange={e => { setInput(e.target.value); setActiveExample(null) }}
                onKeyDown={e => e.key === 'Enter' && handleGenerate()}
                placeholder="e.g. Launch a profitable side business..."
                className="flex-1"
                disabled={generating}
              />
              <Button
                onClick={handleGenerate}
                disabled={!input.trim() || generating}
                loading={generating}
                size="md"
              >
                {generating ? 'Generating...' : 'Generate OKRs'}
              </Button>
            </div>

            {generating && (
              <div className="mt-4 flex items-center gap-3 text-fog animate-fade-in">
                <div className="flex gap-1">
                  {[0,1,2].map(i => (
                    <div key={i} className="w-1.5 h-1.5 rounded-full bg-fog animate-pulse" style={{ animationDelay: `${i*0.15}s` }} />
                  ))}
                </div>
                <p className="font-mono text-2xs tracking-widest">Analyzing goal and generating OKRs...</p>
              </div>
            )}

            {error && (
              <p className="mt-3 font-mono text-2xs text-red-600 bg-red-50 border border-red-200 px-3 py-2 rounded-sm">
                {error}
              </p>
            )}
          </CardContent>
        </Card>

        {/* Goals list */}
        {goals.length === 0 ? (
          <div className="text-center py-20 border border-dashed border-paper-3 rounded-sm">
            <div className="font-display text-5xl text-fog/30 mb-4">◎</div>
            <p className="font-display font-bold text-xl text-fog mb-2">No goals yet</p>
            <p className="font-sans text-sm text-fog/70 max-w-xs mx-auto leading-relaxed">
              Enter a goal above and the AI will break it down into measurable objectives and key results.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-5 group">
            {goals.map(goal => (
              <GoalDashboard
                key={goal.id}
                goal={goal}
                onUpdate={handleUpdateKR}
                onDelete={handleDelete}
                onRefreshAction={handleRefreshAction}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
