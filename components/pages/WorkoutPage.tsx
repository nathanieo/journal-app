'use client'

import { useState, useRef, useMemo, useEffect } from 'react'
import { PageHeader } from '../ui/page-header'
import { Card, CardHeader, CardContent, CardTitle } from '../ui/card'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { cn } from '@/lib/utils'
import { progressHex } from '../ui/progress'

// ─────────────────────────────────────────────────────────────────
// DATA MODEL
// ─────────────────────────────────────────────────────────────────

export interface ExerciseSet {
  reps: number
  weight: number
  unit: 'kg' | 'lbs'
  done: boolean
}

export interface Exercise {
  id: string
  name: string
  muscleGroup: string
  equipment: string
  sets: ExerciseSet[]
}

export interface WorkoutLog {
  date: string           // YYYY-MM-DD
  name: string
  exercises: Exercise[]
  notes?: string
  durationMins?: number
}

// ─────────────────────────────────────────────────────────────────
// EXERCISE LIBRARY  (~80 exercises across all muscle groups)
// ─────────────────────────────────────────────────────────────────

export interface ExerciseDef {
  name: string
  muscleGroup: string    // primary
  equipment: string
  tags?: string[]
}

const LIBRARY: ExerciseDef[] = [
  // ── Chest ──────────────────────────────────────
  { name: 'Bench Press',            muscleGroup: 'Chest',     equipment: 'Barbell' },
  { name: 'Incline Bench Press',    muscleGroup: 'Chest',     equipment: 'Barbell' },
  { name: 'Decline Bench Press',    muscleGroup: 'Chest',     equipment: 'Barbell' },
  { name: 'Dumbbell Press',         muscleGroup: 'Chest',     equipment: 'Dumbbell' },
  { name: 'Incline Dumbbell Press', muscleGroup: 'Chest',     equipment: 'Dumbbell' },
  { name: 'Dumbbell Fly',           muscleGroup: 'Chest',     equipment: 'Dumbbell' },
  { name: 'Cable Fly',              muscleGroup: 'Chest',     equipment: 'Cable' },
  { name: 'Push Up',                muscleGroup: 'Chest',     equipment: 'Bodyweight' },
  { name: 'Dips',                   muscleGroup: 'Chest',     equipment: 'Bodyweight' },
  { name: 'Pec Deck',               muscleGroup: 'Chest',     equipment: 'Machine' },
  // ── Back ───────────────────────────────────────
  { name: 'Deadlift',               muscleGroup: 'Back',      equipment: 'Barbell' },
  { name: 'Romanian Deadlift',      muscleGroup: 'Back',      equipment: 'Barbell' },
  { name: 'Barbell Row',            muscleGroup: 'Back',      equipment: 'Barbell' },
  { name: 'T-Bar Row',              muscleGroup: 'Back',      equipment: 'Barbell' },
  { name: 'Pull Up',                muscleGroup: 'Back',      equipment: 'Bodyweight' },
  { name: 'Chin Up',                muscleGroup: 'Back',      equipment: 'Bodyweight' },
  { name: 'Lat Pulldown',           muscleGroup: 'Back',      equipment: 'Cable' },
  { name: 'Seated Cable Row',       muscleGroup: 'Back',      equipment: 'Cable' },
  { name: 'Single Arm Dumbbell Row',muscleGroup: 'Back',      equipment: 'Dumbbell' },
  { name: 'Face Pull',              muscleGroup: 'Back',      equipment: 'Cable' },
  { name: 'Rack Pull',              muscleGroup: 'Back',      equipment: 'Barbell' },
  // ── Legs ───────────────────────────────────────
  { name: 'Squat',                  muscleGroup: 'Legs',      equipment: 'Barbell' },
  { name: 'Front Squat',            muscleGroup: 'Legs',      equipment: 'Barbell' },
  { name: 'Leg Press',              muscleGroup: 'Legs',      equipment: 'Machine' },
  { name: 'Hack Squat',             muscleGroup: 'Legs',      equipment: 'Machine' },
  { name: 'Bulgarian Split Squat',  muscleGroup: 'Legs',      equipment: 'Dumbbell' },
  { name: 'Lunges',                 muscleGroup: 'Legs',      equipment: 'Dumbbell' },
  { name: 'Leg Curl',               muscleGroup: 'Legs',      equipment: 'Machine' },
  { name: 'Leg Extension',          muscleGroup: 'Legs',      equipment: 'Machine' },
  { name: 'Calf Raise',             muscleGroup: 'Legs',      equipment: 'Machine' },
  { name: 'Seated Calf Raise',      muscleGroup: 'Legs',      equipment: 'Machine' },
  { name: 'Hip Thrust',             muscleGroup: 'Legs',      equipment: 'Barbell' },
  { name: 'Good Morning',           muscleGroup: 'Legs',      equipment: 'Barbell' },
  // ── Shoulders ──────────────────────────────────
  { name: 'Overhead Press',         muscleGroup: 'Shoulders', equipment: 'Barbell' },
  { name: 'Seated Dumbbell Press',  muscleGroup: 'Shoulders', equipment: 'Dumbbell' },
  { name: 'Arnold Press',           muscleGroup: 'Shoulders', equipment: 'Dumbbell' },
  { name: 'Lateral Raise',          muscleGroup: 'Shoulders', equipment: 'Dumbbell' },
  { name: 'Cable Lateral Raise',    muscleGroup: 'Shoulders', equipment: 'Cable' },
  { name: 'Front Raise',            muscleGroup: 'Shoulders', equipment: 'Dumbbell' },
  { name: 'Rear Delt Fly',          muscleGroup: 'Shoulders', equipment: 'Dumbbell' },
  { name: 'Upright Row',            muscleGroup: 'Shoulders', equipment: 'Barbell' },
  { name: 'Shrugs',                 muscleGroup: 'Shoulders', equipment: 'Barbell' },
  // ── Arms ───────────────────────────────────────
  { name: 'Barbell Curl',           muscleGroup: 'Arms',      equipment: 'Barbell' },
  { name: 'Dumbbell Curl',          muscleGroup: 'Arms',      equipment: 'Dumbbell' },
  { name: 'Hammer Curl',            muscleGroup: 'Arms',      equipment: 'Dumbbell' },
  { name: 'Preacher Curl',          muscleGroup: 'Arms',      equipment: 'Barbell' },
  { name: 'Cable Curl',             muscleGroup: 'Arms',      equipment: 'Cable' },
  { name: 'Concentration Curl',     muscleGroup: 'Arms',      equipment: 'Dumbbell' },
  { name: 'Tricep Pushdown',        muscleGroup: 'Arms',      equipment: 'Cable' },
  { name: 'Overhead Tricep Extension', muscleGroup: 'Arms',   equipment: 'Cable' },
  { name: 'Skull Crusher',          muscleGroup: 'Arms',      equipment: 'Barbell' },
  { name: 'Close Grip Bench Press', muscleGroup: 'Arms',      equipment: 'Barbell' },
  { name: 'Tricep Kickback',        muscleGroup: 'Arms',      equipment: 'Dumbbell' },
  { name: 'Diamond Push Up',        muscleGroup: 'Arms',      equipment: 'Bodyweight' },
  // ── Core ───────────────────────────────────────
  { name: 'Plank',                  muscleGroup: 'Core',      equipment: 'Bodyweight' },
  { name: 'Side Plank',             muscleGroup: 'Core',      equipment: 'Bodyweight' },
  { name: 'Crunch',                 muscleGroup: 'Core',      equipment: 'Bodyweight' },
  { name: 'Hanging Leg Raise',      muscleGroup: 'Core',      equipment: 'Bodyweight' },
  { name: 'Ab Wheel Rollout',       muscleGroup: 'Core',      equipment: 'Equipment' },
  { name: 'Russian Twist',          muscleGroup: 'Core',      equipment: 'Bodyweight' },
  { name: 'Cable Crunch',           muscleGroup: 'Core',      equipment: 'Cable' },
  { name: 'Dragon Flag',            muscleGroup: 'Core',      equipment: 'Bodyweight' },
  { name: 'Pallof Press',           muscleGroup: 'Core',      equipment: 'Cable' },
  { name: 'V-Up',                   muscleGroup: 'Core',      equipment: 'Bodyweight' },
  // ── Cardio ─────────────────────────────────────
  { name: 'Running',                muscleGroup: 'Cardio',    equipment: 'None' },
  { name: 'Cycling',                muscleGroup: 'Cardio',    equipment: 'Equipment' },
  { name: 'Jump Rope',              muscleGroup: 'Cardio',    equipment: 'Equipment' },
  { name: 'Rowing Machine',         muscleGroup: 'Cardio',    equipment: 'Machine' },
  { name: 'Stair Climber',          muscleGroup: 'Cardio',    equipment: 'Machine' },
  { name: 'Battle Ropes',           muscleGroup: 'Cardio',    equipment: 'Equipment' },
  { name: 'Sled Push',              muscleGroup: 'Cardio',    equipment: 'Equipment' },
  { name: 'Box Jump',               muscleGroup: 'Cardio',    equipment: 'Bodyweight' },
]

const MUSCLE_GROUPS = ['All', 'Chest', 'Back', 'Legs', 'Shoulders', 'Arms', 'Core', 'Cardio']
const EQUIPMENT_TYPES = ['All', 'Barbell', 'Dumbbell', 'Cable', 'Machine', 'Bodyweight']

// ─────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────

function emptySet(): ExerciseSet { return { reps: 0, weight: 0, unit: 'lbs', done: false } }
function totalVol(ex: Exercise) { return ex.sets.reduce((s, set) => s + set.reps * set.weight, 0) }
function maxW(ex: Exercise) { return Math.max(...ex.sets.map(s => s.weight), 0) }

function loadLogs(): WorkoutLog[] {
  try { return JSON.parse(localStorage.getItem('workout_v3') || '[]') } catch { return [] }
}
function saveLogs(logs: WorkoutLog[]) {
  localStorage.setItem('workout_v3', JSON.stringify(logs))
}

// Get the date string for exactly N days ago
function daysAgo(n: number): string {
  const d = new Date()
  d.setDate(d.getDate() - n)
  return d.toISOString().split('T')[0]
}

// Get most-recent exercises across all logs (deduplicated, most recent first)
function getRecentExercises(logs: WorkoutLog[], today: string, limit = 8): ExerciseDef[] {
  const seen = new Set<string>()
  const result: ExerciseDef[] = []
  for (const log of [...logs].sort((a, b) => b.date.localeCompare(a.date))) {
    if (log.date === today) continue
    for (const ex of log.exercises) {
      if (!seen.has(ex.name)) {
        seen.add(ex.name)
        const def = LIBRARY.find(d => d.name === ex.name) || { name: ex.name, muscleGroup: ex.muscleGroup || 'Other', equipment: 'Other' }
        result.push(def)
        if (result.length >= limit) return result
      }
    }
  }
  return result
}

// ─────────────────────────────────────────────────────────────────
// SUB-COMPONENTS
// ─────────────────────────────────────────────────────────────────

// Pill-style muscle group badge
function MuscleTag({ group }: { group: string }) {
  const colors: Record<string, string> = {
    Chest:     'bg-blue-50 text-blue-600 border-blue-100',
    Back:      'bg-violet-50 text-violet-600 border-violet-100',
    Legs:      'bg-orange-50 text-orange-600 border-orange-100',
    Shoulders: 'bg-sky-50 text-sky-600 border-sky-100',
    Arms:      'bg-pink-50 text-pink-600 border-pink-100',
    Core:      'bg-yellow-50 text-yellow-600 border-yellow-100',
    Cardio:    'bg-green-50 text-green-600 border-green-100',
    Other:     'bg-paper-3 text-fog border-paper-3',
  }
  return (
    <span className={cn('font-mono text-2xs px-2 py-0.5 border rounded-sm', colors[group] || colors.Other)}>
      {group}
    </span>
  )
}

// Single exercise card in the workout log
function ExerciseCard({
  ex, lastEx, onUpdateSet, onAddSet, onRemoveSet, onRemove,
}: {
  ex: Exercise
  lastEx: Exercise | null
  onUpdateSet: (si: number, field: keyof ExerciseSet, value: string | number | boolean) => void
  onAddSet: () => void
  onRemoveSet: (si: number) => void
  onRemove: () => void
}) {
  const vol = totalVol(ex)
  const lastVol = lastEx ? totalVol(lastEx) : 0
  const best = maxW(ex)
  const lastBest = lastEx ? maxW(lastEx) : 0
  const doneCount = ex.sets.filter(s => s.done).length
  const isPR = best > 0 && best > lastBest

  return (
    <Card className="overflow-hidden p-0">
      <div className="px-5 py-3.5 bg-paper border-b border-paper-3 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-0.5">
            <p className="font-display font-bold text-sm text-ink">{ex.name}</p>
            {isPR && <span className="font-mono text-2xs px-1.5 py-0.5 bg-amber-100 text-amber-700 border border-amber-200 rounded-sm">↑ PR</span>}
          </div>
          <div className="flex items-center gap-2">
            <MuscleTag group={ex.muscleGroup} />
            {lastEx ? (
              <span className="font-mono text-2xs text-fog">
                Last: {lastBest}{lastEx.sets[0]?.unit} · {lastVol} vol
              </span>
            ) : (
              <span className="font-mono text-2xs text-fog">First session</span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="font-mono text-2xs text-fog">{doneCount}/{ex.sets.length} sets</span>
          <button
            onClick={onRemove}
            className="font-mono text-2xs text-smoke hover:text-red-500 border border-transparent hover:border-red-200 px-2 py-1 rounded-sm transition-all"
          >
            Remove
          </button>
        </div>
      </div>

      <div className="px-5 pt-2 pb-4">
        {/* Header row */}
        <div className="grid grid-cols-[32px_1fr_76px_76px_60px_24px] gap-2 py-2 border-b border-paper-3 mb-1">
          {['#', 'Previous', 'Weight', 'Reps', 'Unit', ''].map((h, i) => (
            <span key={i} className="font-mono text-2xs text-fog uppercase tracking-widest">{h}</span>
          ))}
        </div>

        {ex.sets.map((set, si) => {
          const lastSet = lastEx?.sets[si]
          return (
            <div
              key={si}
              className={cn(
                'grid grid-cols-[32px_1fr_76px_76px_60px_24px] gap-2 items-center py-1.5 border-b border-paper-3 last:border-none transition-colors duration-150',
                set.done && 'bg-ink/[0.025]'
              )}
            >
              <button
                onClick={() => onUpdateSet(si, 'done', !set.done)}
                className={cn(
                  'w-6 h-6 rounded-full border flex items-center justify-center font-mono text-2xs transition-all duration-150',
                  set.done ? 'bg-ink border-ink text-paper' : 'border-smoke text-fog hover:border-ink'
                )}
              >
                {set.done ? '✓' : si + 1}
              </button>

              <span className="font-mono text-2xs text-fog truncate">
                {lastSet ? `${lastSet.weight}${lastSet.unit} × ${lastSet.reps}` : '—'}
              </span>

              <input
                type="number"
                value={set.weight || ''}
                placeholder={lastSet ? String(lastSet.weight) : '0'}
                onChange={e => onUpdateSet(si, 'weight', e.target.value)}
                className="text-center font-mono text-sm font-semibold text-ink bg-transparent border-b border-smoke outline-none focus:border-ink transition-colors w-full"
              />
              <input
                type="number"
                value={set.reps || ''}
                placeholder={lastSet ? String(lastSet.reps) : '0'}
                onChange={e => onUpdateSet(si, 'reps', e.target.value)}
                className="text-center font-mono text-sm font-semibold text-ink bg-transparent border-b border-smoke outline-none focus:border-ink transition-colors w-full"
              />
              <select
                value={set.unit}
                onChange={e => onUpdateSet(si, 'unit', e.target.value)}
                className="font-mono text-2xs text-ash bg-transparent border border-smoke rounded-sm px-1 py-1 focus:outline-none focus:border-ink"
              >
                <option value="lbs">lbs</option>
                <option value="kg">kg</option>
              </select>
              <button
                onClick={() => onRemoveSet(si)}
                className="text-smoke hover:text-red-500 transition-colors font-mono text-sm text-center"
              >×</button>
            </div>
          )
        })}

        <div className="flex items-center justify-between mt-3 pt-2">
          <Button variant="outline" size="sm" onClick={onAddSet}>+ Set</Button>
          <span className="font-mono text-2xs text-ash">
            Vol: <strong>{vol}</strong>
            {lastVol > 0 && (
              <span className={cn('ml-1.5', vol > lastVol ? 'text-success' : vol < lastVol ? 'text-red-400' : 'text-fog')}>
                ({vol >= lastVol ? '+' : ''}{vol - lastVol})
              </span>
            )}
          </span>
        </div>
      </div>
    </Card>
  )
}

// Search + filter panel for exercise library
function ExercisePicker({ onAdd, alreadyAdded }: {
  onAdd: (def: ExerciseDef) => void
  alreadyAdded: string[]
}) {
  const [query, setQuery] = useState('')
  const [muscle, setMuscle] = useState('All')
  const [equipment, setEquipment] = useState('All')
  const searchRef = useRef<HTMLInputElement>(null)

  useEffect(() => { searchRef.current?.focus() }, [])

  const results = useMemo(() => {
    return LIBRARY.filter(ex => {
      const matchQ = !query || ex.name.toLowerCase().includes(query.toLowerCase())
      const matchM = muscle === 'All' || ex.muscleGroup === muscle
      const matchE = equipment === 'All' || ex.equipment === equipment
      return matchQ && matchM && matchE
    })
  }, [query, muscle, equipment])

  return (
    <div className="flex flex-col gap-4">
      {/* Search bar */}
      <div className="relative">
        <svg viewBox="0 0 16 16" className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 fill-fog pointer-events-none">
          <path d="M6.5 1a5.5 5.5 0 104.39 8.83l3.14 3.14a.75.75 0 001.06-1.06l-3.14-3.14A5.5 5.5 0 006.5 1zm-4 5.5a4 4 0 118 0 4 4 0 01-8 0z"/>
        </svg>
        <input
          ref={searchRef}
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Search exercises..."
          className="w-full pl-9 pr-4 py-2.5 font-sans text-sm bg-pure-white border border-smoke rounded-sm text-ink placeholder:text-fog focus:outline-none focus:border-ink transition-colors"
        />
        {query && (
          <button onClick={() => setQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-fog hover:text-ink font-mono text-base">×</button>
        )}
      </div>

      {/* Filter chips */}
      <div className="flex flex-col gap-2">
        <div className="flex gap-1.5 flex-wrap">
          {MUSCLE_GROUPS.map(g => (
            <button key={g} onClick={() => setMuscle(g)}
              className={cn(
                'font-mono text-2xs px-2.5 py-1 border rounded-sm cursor-pointer transition-all duration-150',
                muscle === g ? 'bg-ink text-paper border-ink' : 'bg-transparent text-ash border-smoke hover:border-ink hover:text-ink'
              )}>
              {g}
            </button>
          ))}
        </div>
        <div className="flex gap-1.5 flex-wrap">
          {EQUIPMENT_TYPES.map(e => (
            <button key={e} onClick={() => setEquipment(e)}
              className={cn(
                'font-mono text-2xs px-2.5 py-1 border rounded-sm cursor-pointer transition-all duration-150',
                equipment === e ? 'bg-ash text-paper border-ash' : 'bg-transparent text-fog border-paper-3 hover:border-smoke hover:text-ash'
              )}>
              {e}
            </button>
          ))}
        </div>
      </div>

      {/* Results */}
      <div className="max-h-64 overflow-y-auto -mx-1 px-1">
        {results.length === 0 ? (
          <div className="text-center py-8">
            <p className="font-sans text-sm text-fog">No exercises found.</p>
            <p className="font-mono text-2xs text-smoke mt-1">Try a different filter or add custom below.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-1.5">
            {results.map(def => {
              const added = alreadyAdded.includes(def.name)
              return (
                <button
                  key={def.name}
                  onClick={() => !added && onAdd(def)}
                  disabled={added}
                  className={cn(
                    'flex items-start justify-between gap-2 px-3 py-2.5 border rounded-sm text-left transition-all duration-150',
                    added
                      ? 'border-paper-3 bg-paper-3/50 cursor-default'
                      : 'border-paper-3 bg-pure-white hover:border-ink hover:bg-ink hover:text-paper group cursor-pointer'
                  )}
                >
                  <div>
                    <p className={cn('font-sans text-xs font-medium leading-tight', added ? 'text-fog' : 'text-ink group-hover:text-paper')}>
                      {def.name}
                    </p>
                    <p className={cn('font-mono text-2xs mt-0.5', added ? 'text-smoke' : 'text-fog group-hover:text-paper/60')}>
                      {def.equipment}
                    </p>
                  </div>
                  {added
                    ? <span className="font-mono text-2xs text-smoke flex-shrink-0 mt-0.5">Added</span>
                    : <span className="font-mono text-sm text-fog group-hover:text-paper flex-shrink-0">+</span>
                  }
                </button>
              )
            })}
          </div>
        )}
      </div>

      {/* Custom exercise */}
      <div className="pt-3 border-t border-paper-3">
        <CustomExerciseInput onAdd={name => onAdd({ name, muscleGroup: 'Other', equipment: 'Other' })} />
      </div>
    </div>
  )
}

function CustomExerciseInput({ onAdd }: { onAdd: (name: string) => void }) {
  const [val, setVal] = useState('')
  function submit() {
    if (!val.trim()) return
    onAdd(val.trim())
    setVal('')
  }
  return (
    <div className="flex gap-2">
      <input
        value={val}
        onChange={e => setVal(e.target.value)}
        onKeyDown={e => e.key === 'Enter' && submit()}
        placeholder="Custom exercise name..."
        className="flex-1 font-sans text-sm bg-transparent border-b border-smoke outline-none px-0 py-1.5 text-ink placeholder:text-fog focus:border-ink transition-colors"
      />
      <Button variant="ghost" size="sm" onClick={submit}>Add</Button>
    </div>
  )
}

// Last week suggestion banner
function LastWeekSuggestion({
  lastWeekLog, todayExerciseNames, onAddAll, onAddOne,
}: {
  lastWeekLog: WorkoutLog | null
  todayExerciseNames: string[]
  onAddAll: (exercises: Exercise[]) => void
  onAddOne: (ex: Exercise) => void
}) {
  const [expanded, setExpanded] = useState(true)
  if (!lastWeekLog || lastWeekLog.exercises.length === 0) return null

  const unadded = lastWeekLog.exercises.filter(ex => !todayExerciseNames.includes(ex.name))
  if (unadded.length === 0) return null

  const dayName = new Date(lastWeekLog.date + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'long' })
  const shortDate = new Date(lastWeekLog.date + 'T12:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })

  return (
    <div className="mb-6 border border-ink/10 bg-ink/[0.02] rounded-sm overflow-hidden">
      {/* Header */}
      <button
        onClick={() => setExpanded(e => !e)}
        className="w-full flex items-center justify-between px-5 py-3.5 hover:bg-ink/[0.03] transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="w-1.5 h-1.5 rounded-full bg-ink flex-shrink-0" />
          <div className="text-left">
            <p className="font-mono text-2xs tracking-widest uppercase text-ink">Last {dayName}</p>
            <p className="font-mono text-2xs text-fog mt-0.5">{shortDate} · {lastWeekLog.name} · {lastWeekLog.exercises.length} exercises</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button
            size="sm"
            variant="ghost"
            onClick={e => { e.stopPropagation(); onAddAll(unadded) }}
          >
            Copy All ({unadded.length})
          </Button>
          <span className={cn('font-mono text-2xs text-fog transition-transform duration-200', !expanded && '-rotate-90')}>▼</span>
        </div>
      </button>

      {/* Exercise list */}
      {expanded && (
        <div className="px-5 pb-4 grid grid-cols-2 gap-2 border-t border-ink/5">
          {unadded.map(ex => {
            const vol = totalVol(ex)
            const best = maxW(ex)
            return (
              <button
                key={ex.id}
                onClick={() => onAddOne(ex)}
                className="flex items-start justify-between gap-2 p-3 bg-pure-white border border-paper-3 rounded-sm text-left hover:border-ink hover:bg-ink hover:text-paper group transition-all duration-150"
              >
                <div>
                  <p className="font-sans text-xs font-medium text-ink group-hover:text-paper leading-tight">{ex.name}</p>
                  <p className="font-mono text-2xs text-fog group-hover:text-paper/60 mt-0.5">
                    {ex.sets.length} sets · {best > 0 ? `${best}${ex.sets[0]?.unit}` : '—'}
                    {vol > 0 && ` · ${vol} vol`}
                  </p>
                </div>
                <span className="font-mono text-sm text-fog group-hover:text-paper flex-shrink-0">+</span>
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}

// Recent exercises quick-add strip
function RecentExercises({
  recents, todayExerciseNames, onAdd,
}: {
  recents: ExerciseDef[]
  todayExerciseNames: string[]
  onAdd: (def: ExerciseDef) => void
}) {
  if (recents.length === 0) return null
  const unadded = recents.filter(r => !todayExerciseNames.includes(r.name))
  if (unadded.length === 0) return null

  return (
    <div className="mb-6">
      <p className="font-mono text-2xs tracking-widest uppercase text-fog mb-3">Recently Used</p>
      <div className="flex gap-2 flex-wrap">
        {unadded.map(def => (
          <button
            key={def.name}
            onClick={() => onAdd(def)}
            className="flex items-center gap-1.5 px-3 py-2 border border-paper-3 bg-pure-white rounded-sm font-sans text-xs text-ink hover:border-ink hover:bg-ink hover:text-paper transition-all duration-150 group"
          >
            <MuscleTag group={def.muscleGroup} />
            <span className="font-medium">{def.name}</span>
            <span className="font-mono text-sm text-fog group-hover:text-paper ml-0.5">+</span>
          </button>
        ))}
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────
// MAIN WORKOUT PAGE
// ─────────────────────────────────────────────────────────────────

export default function WorkoutPage() {
  const today = new Date().toISOString().split('T')[0]

  const [logs, setLogsState] = useState<WorkoutLog[]>(() => loadLogs())
  const [view, setView] = useState<'log' | 'history'>('log')
  const [showPicker, setShowPicker] = useState(false)
  const [workoutName, setWorkoutName] = useState('Morning Workout')
  const [startTime] = useState(Date.now())

  function persistLogs(updated: WorkoutLog[]) {
    setLogsState(updated)
    saveLogs(updated)
  }

  const todayLog: WorkoutLog = useMemo(
    () => logs.find(l => l.date === today) || { date: today, name: workoutName, exercises: [], notes: '' },
    [logs, today, workoutName]
  )
  const pastLogs = useMemo(
    () => logs.filter(l => l.date !== today).sort((a, b) => b.date.localeCompare(a.date)),
    [logs, today]
  )

  // ── Same-day-last-week logic ──────────────────────────────────
  // Walk back 6–8 days to find the closest matching weekday
  const lastWeekLog = useMemo(() => {
    const todayDate = new Date(today)
    const todayWeekday = todayDate.getDay() // 0=Sun…6=Sat
    // Look in a 14-day window for the same weekday
    for (let offset = 7; offset <= 14; offset++) {
      const candidate = daysAgo(offset)
      const candidateWeekday = new Date(candidate).getDay()
      if (candidateWeekday === todayWeekday) {
        const found = logs.find(l => l.date === candidate)
        if (found && found.exercises.length > 0) return found
      }
    }
    // Fallback: most recent workout within last 14 days
    for (let offset = 1; offset <= 14; offset++) {
      const candidate = daysAgo(offset)
      const found = logs.find(l => l.date === candidate)
      if (found && found.exercises.length > 0) return found
    }
    return null
  }, [logs, today])

  // ── Recent exercises ──────────────────────────────────────────
  const recentExercises = useMemo(() => getRecentExercises(logs, today), [logs, today])

  // ── Previous performance lookup ───────────────────────────────
  function getLastLog(name: string): Exercise | null {
    for (const log of pastLogs) {
      const f = log.exercises.find(ex => ex.name.toLowerCase() === name.toLowerCase())
      if (f) return f
    }
    return null
  }

  // ── Mutations ─────────────────────────────────────────────────
  function upsertToday(updated: WorkoutLog) {
    persistLogs(
      logs.some(l => l.date === today)
        ? logs.map(l => l.date === today ? updated : l)
        : [...logs, updated]
    )
  }

  function addExercise(def: ExerciseDef) {
    // Don't double-add
    if (todayLog.exercises.some(e => e.name === def.name)) return
    const ex: Exercise = {
      id: Date.now().toString() + Math.random(),
      name: def.name,
      muscleGroup: def.muscleGroup,
      equipment: def.equipment,
      sets: [emptySet()],
    }
    upsertToday({ ...todayLog, exercises: [...todayLog.exercises, ex] })
    setShowPicker(false)
  }

  // Add from last week — carry over sets/reps/weight as starting point
  function addFromLastWeek(lastEx: Exercise) {
    if (todayLog.exercises.some(e => e.name === lastEx.name)) return
    const ex: Exercise = {
      id: Date.now().toString() + Math.random(),
      name: lastEx.name,
      muscleGroup: lastEx.muscleGroup,
      equipment: lastEx.sets[0] ? lastEx.muscleGroup : 'Other',
      // Copy previous sets as starting templates (done=false so user confirms each)
      sets: lastEx.sets.map(s => ({ ...s, done: false })),
    }
    upsertToday({ ...todayLog, exercises: [...todayLog.exercises, ex] })
  }

  function addAllFromLastWeek(exercises: Exercise[]) {
    const toAdd = exercises.filter(ex => !todayLog.exercises.some(e => e.name === ex.name))
    if (toAdd.length === 0) return
    const newExercises = toAdd.map(lastEx => ({
      id: Date.now().toString() + Math.random() + lastEx.name,
      name: lastEx.name,
      muscleGroup: lastEx.muscleGroup,
      equipment: lastEx.muscleGroup,
      sets: lastEx.sets.map(s => ({ ...s, done: false })),
    }))
    upsertToday({ ...todayLog, exercises: [...todayLog.exercises, ...newExercises] })
  }

  function updateSet(exId: string, si: number, field: keyof ExerciseSet, value: string | number | boolean) {
    upsertToday({
      ...todayLog,
      exercises: todayLog.exercises.map(ex => {
        if (ex.id !== exId) return ex
        return {
          ...ex,
          sets: ex.sets.map((s, i) =>
            i === si ? { ...s, [field]: field === 'unit' ? value : field === 'done' ? value : Number(value) } : s
          ),
        }
      }),
    })
  }

  function addSet(exId: string) {
    upsertToday({ ...todayLog, exercises: todayLog.exercises.map(ex => ex.id === exId ? { ...ex, sets: [...ex.sets, emptySet()] } : ex) })
  }

  function removeSet(exId: string, si: number) {
    upsertToday({ ...todayLog, exercises: todayLog.exercises.map(ex => ex.id === exId ? { ...ex, sets: ex.sets.filter((_, i) => i !== si) } : ex) })
  }

  function removeExercise(exId: string) {
    upsertToday({ ...todayLog, exercises: todayLog.exercises.filter(ex => ex.id !== exId) })
  }

  const elapsed = Math.floor((Date.now() - startTime) / 60000)
  const todayExerciseNames = todayLog.exercises.map(e => e.name)
  const totalSetsLogged = todayLog.exercises.reduce((s, ex) => s + ex.sets.length, 0)
  const doneSets = todayLog.exercises.reduce((s, ex) => s + ex.sets.filter(set => set.done).length, 0)

  // ─────────────────────────────────────────────
  return (
    <div className="animate-fade-up flex flex-col min-h-screen">
      <PageHeader title="Workout" subtitle="Log Sets — Track Progress">
        <div className="flex border border-smoke rounded-sm overflow-hidden">
          {(['log', 'history'] as const).map(v => (
            <button key={v} onClick={() => setView(v)}
              className={cn(
                'px-4 py-2 font-mono text-2xs tracking-widest uppercase cursor-pointer transition-all duration-150',
                view === v ? 'bg-ink text-paper' : 'bg-transparent text-ash hover:bg-paper-3'
              )}>
              {v === 'log' ? 'Today' : 'History'}
            </button>
          ))}
        </div>
      </PageHeader>

      {/* ── TODAY LOG ─────────────────────────────── */}
      {view === 'log' && (
        <div className="px-14 py-8 flex-1 max-w-3xl">

          {/* Session bar */}
          <div className="flex items-center gap-4 mb-7 px-5 py-3.5 bg-pure-white border border-paper-3 rounded-sm shadow-card">
            <input
              type="text"
              value={workoutName}
              onChange={e => { setWorkoutName(e.target.value); upsertToday({ ...todayLog, name: e.target.value }) }}
              className="flex-1 font-display font-bold text-sm text-ink bg-transparent border-0 border-b border-smoke pb-1 outline-none focus:border-ink transition-colors"
            />
            <div className="flex items-center gap-4 flex-shrink-0">
              {totalSetsLogged > 0 && (
                <div className="flex items-center gap-1.5">
                  <div className="w-16 h-1 bg-paper-3 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${(doneSets / totalSetsLogged) * 100}%`,
                        background: progressHex(Math.round((doneSets / totalSetsLogged) * 100)),
                      }}
                    />
                  </div>
                  <span className="font-mono text-2xs text-fog">{doneSets}/{totalSetsLogged}</span>
                </div>
              )}
              <span className="font-mono text-2xs text-fog">
                {elapsed}m · {todayLog.exercises.length} exercises
              </span>
            </div>
          </div>

          {/* Last week suggestion */}
          <LastWeekSuggestion
            lastWeekLog={lastWeekLog}
            todayExerciseNames={todayExerciseNames}
            onAddAll={addAllFromLastWeek}
            onAddOne={addFromLastWeek}
          />

          {/* Recent exercises quick-add */}
          <RecentExercises
            recents={recentExercises}
            todayExerciseNames={todayExerciseNames}
            onAdd={addExercise}
          />

          {/* Exercise cards */}
          {todayLog.exercises.length > 0 && (
            <div className="flex flex-col gap-4 mb-6">
              {todayLog.exercises.map(ex => (
                <ExerciseCard
                  key={ex.id}
                  ex={ex}
                  lastEx={getLastLog(ex.name)}
                  onUpdateSet={(si, field, val) => updateSet(ex.id, si, field, val)}
                  onAddSet={() => addSet(ex.id)}
                  onRemoveSet={si => removeSet(ex.id, si)}
                  onRemove={() => removeExercise(ex.id)}
                />
              ))}
            </div>
          )}

          {/* Add exercise panel */}
          <Card className="mb-6">
            <CardHeader className="flex flex-row items-center justify-between pb-0">
              <CardTitle>Add Exercise</CardTitle>
              <Button size="sm" onClick={() => setShowPicker(p => !p)}>
                {showPicker ? 'Close' : '+ Exercise'}
              </Button>
            </CardHeader>
            {showPicker && (
              <CardContent className="pt-4">
                <ExercisePicker
                  onAdd={addExercise}
                  alreadyAdded={todayExerciseNames}
                />
              </CardContent>
            )}
          </Card>

          {/* Notes */}
          {todayLog.exercises.length > 0 && (
            <Card>
              <CardHeader><CardTitle>Notes</CardTitle></CardHeader>
              <CardContent>
                <textarea
                  rows={2}
                  defaultValue={todayLog.notes || ''}
                  placeholder="How did it feel? PRs? Injuries? Recovery..."
                  onBlur={e => upsertToday({ ...todayLog, notes: e.target.value })}
                  className="w-full bg-transparent border-0 border-b border-smoke outline-none resize-none text-sm text-ink leading-[1.9] placeholder:text-fog focus:border-ink transition-colors"
                />
              </CardContent>
            </Card>
          )}

          {/* Empty state */}
          {todayLog.exercises.length === 0 && !showPicker && (
            <div className="text-center py-14 border border-dashed border-paper-3 rounded-sm mb-6">
              <p className="font-display font-bold text-base text-fog mb-1">No exercises yet</p>
              <p className="font-sans text-sm text-fog/70 mb-5">
                {lastWeekLog ? `Last ${new Date(lastWeekLog.date + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'long' })} you did ${lastWeekLog.exercises.length} exercises. Copy them above or add new ones.` : 'Add your first exercise to start logging.'}
              </p>
              <Button size="sm" onClick={() => setShowPicker(true)}>Browse Library</Button>
            </div>
          )}
        </div>
      )}

      {/* ── HISTORY ────────────────────────────────── */}
      {view === 'history' && (
        <div className="px-14 py-8 max-w-3xl">
          {pastLogs.length === 0 ? (
            <p className="text-center py-20 font-display italic text-base text-fog">No past workouts yet.</p>
          ) : (
            <div className="flex flex-col gap-4">
              {pastLogs.map(log => {
                const tSets = log.exercises.reduce((s, ex) => s + ex.sets.length, 0)
                const tVol = log.exercises.reduce((s, ex) => s + totalVol(ex), 0)
                const muscleGroups = [...new Set(log.exercises.map(ex => ex.muscleGroup))].slice(0, 4)
                return (
                  <Card key={log.date} className="overflow-hidden p-0">
                    <div className="px-5 py-4 bg-paper border-b border-paper-3 flex items-start justify-between">
                      <div>
                        <p className="font-display font-bold text-sm text-ink">{log.name || 'Workout'}</p>
                        <p className="font-mono text-2xs text-fog mt-0.5">
                          {new Date(log.date + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                          {' · '}{log.exercises.length} exercises · {tSets} sets · {tVol > 0 ? `${tVol} vol` : '—'}
                        </p>
                        <div className="flex gap-1.5 mt-2 flex-wrap">
                          {muscleGroups.map(g => <MuscleTag key={g} group={g} />)}
                        </div>
                      </div>
                    </div>
                    <div className="px-5 py-3">
                      {log.exercises.map(ex => (
                        <div key={ex.id} className="flex items-start justify-between py-2 border-b border-paper-3 last:border-none">
                          <div>
                            <p className="font-sans text-xs font-medium text-ink mb-1.5">{ex.name}</p>
                            <div className="flex gap-1.5 flex-wrap">
                              {ex.sets.map((set, si) => (
                                <span key={si} className="font-mono text-2xs text-ash bg-paper border border-paper-3 px-2 py-0.5 rounded-sm">
                                  {set.weight > 0 ? `${set.weight}${set.unit}` : '—'} × {set.reps > 0 ? set.reps : '—'}
                                </span>
                              ))}
                            </div>
                          </div>
                          <div className="text-right ml-4 flex-shrink-0">
                            <p className="font-mono text-2xs text-ash">{maxW(ex) > 0 ? `${maxW(ex)}${ex.sets[0]?.unit} max` : '—'}</p>
                            <p className="font-mono text-2xs text-fog mt-0.5">{totalVol(ex) > 0 ? `${totalVol(ex)} vol` : '—'}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                    {log.notes && (
                      <div className="px-5 py-3 border-t border-paper-3">
                        <p className="font-sans text-xs text-ash italic">{log.notes}</p>
                      </div>
                    )}
                  </Card>
                )
              })}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
