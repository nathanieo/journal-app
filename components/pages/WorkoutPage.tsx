'use client'

import { useState, useMemo } from 'react'
import { PageHeader } from '../ui/page-header'
import { Card } from '../ui/card'
import { Button } from '../ui/button'
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
  completed?: boolean    // NEW — true once user hits "Finish Workout"
  completedAt?: string   // NEW — ISO timestamp
  effort?: number        // NEW — 1–5 rating
}

// ─────────────────────────────────────────────────────────────────
// EXERCISE LIBRARY  (~80 exercises across all muscle groups)
// ─────────────────────────────────────────────────────────────────

export interface ExerciseDef {
  name: string
  muscleGroup: string
  equipment: string
  tags?: string[]
}

const LIBRARY: ExerciseDef[] = [
  // ── Chest ──────────────────────────────────────
  { name: 'Bench Press',            muscleGroup: 'Chest',     equipment: 'Barbell' },
  { name: 'Incline Bench Press',    muscleGroup: 'Chest',     equipment: 'Barbell' },
  { name: 'Decline Bench Press',    muscleGroup: 'Chest',     equipment: 'Barbell' },
  { name: 'Dumbbell Fly',           muscleGroup: 'Chest',     equipment: 'Dumbbell' },
  { name: 'Cable Fly',              muscleGroup: 'Chest',     equipment: 'Cable' },
  { name: 'Push-Up',                muscleGroup: 'Chest',     equipment: 'Bodyweight' },
  { name: 'Chest Dip',              muscleGroup: 'Chest',     equipment: 'Bodyweight' },
  { name: 'Pec Deck',               muscleGroup: 'Chest',     equipment: 'Machine' },
  { name: 'Dumbbell Press',         muscleGroup: 'Chest',     equipment: 'Dumbbell' },
  // ── Back ───────────────────────────────────────
  { name: 'Pull-Up',                muscleGroup: 'Back',      equipment: 'Bodyweight' },
  { name: 'Chin-Up',                muscleGroup: 'Back',      equipment: 'Bodyweight' },
  { name: 'Barbell Row',            muscleGroup: 'Back',      equipment: 'Barbell' },
  { name: 'Dumbbell Row',           muscleGroup: 'Back',      equipment: 'Dumbbell' },
  { name: 'Seated Cable Row',       muscleGroup: 'Back',      equipment: 'Cable' },
  { name: 'Lat Pulldown',           muscleGroup: 'Back',      equipment: 'Cable' },
  { name: 'T-Bar Row',              muscleGroup: 'Back',      equipment: 'Barbell' },
  { name: 'Face Pull',              muscleGroup: 'Back',      equipment: 'Cable' },
  { name: 'Deadlift',               muscleGroup: 'Back',      equipment: 'Barbell' },
  { name: 'Romanian Deadlift',      muscleGroup: 'Back',      equipment: 'Barbell' },
  { name: 'Good Morning',           muscleGroup: 'Back',      equipment: 'Barbell' },
  // ── Legs ───────────────────────────────────────
  { name: 'Squat',                  muscleGroup: 'Legs',      equipment: 'Barbell' },
  { name: 'Front Squat',            muscleGroup: 'Legs',      equipment: 'Barbell' },
  { name: 'Leg Press',              muscleGroup: 'Legs',      equipment: 'Machine' },
  { name: 'Hack Squat',             muscleGroup: 'Legs',      equipment: 'Machine' },
  { name: 'Leg Extension',          muscleGroup: 'Legs',      equipment: 'Machine' },
  { name: 'Leg Curl',               muscleGroup: 'Legs',      equipment: 'Machine' },
  { name: 'Lunge',                  muscleGroup: 'Legs',      equipment: 'Dumbbell' },
  { name: 'Bulgarian Split Squat',  muscleGroup: 'Legs',      equipment: 'Dumbbell' },
  { name: 'Calf Raise',             muscleGroup: 'Legs',      equipment: 'Machine' },
  { name: 'Hip Thrust',             muscleGroup: 'Legs',      equipment: 'Barbell' },
  { name: 'Glute Bridge',           muscleGroup: 'Legs',      equipment: 'Bodyweight' },
  { name: 'Step-Up',                muscleGroup: 'Legs',      equipment: 'Dumbbell' },
  // ── Shoulders ──────────────────────────────────
  { name: 'Overhead Press',         muscleGroup: 'Shoulders', equipment: 'Barbell' },
  { name: 'Dumbbell Shoulder Press',muscleGroup: 'Shoulders', equipment: 'Dumbbell' },
  { name: 'Arnold Press',           muscleGroup: 'Shoulders', equipment: 'Dumbbell' },
  { name: 'Lateral Raise',          muscleGroup: 'Shoulders', equipment: 'Dumbbell' },
  { name: 'Front Raise',            muscleGroup: 'Shoulders', equipment: 'Dumbbell' },
  { name: 'Cable Lateral Raise',    muscleGroup: 'Shoulders', equipment: 'Cable' },
  { name: 'Rear Delt Fly',          muscleGroup: 'Shoulders', equipment: 'Dumbbell' },
  { name: 'Upright Row',            muscleGroup: 'Shoulders', equipment: 'Barbell' },
  { name: 'Shrug',                  muscleGroup: 'Shoulders', equipment: 'Barbell' },
  // ── Arms ───────────────────────────────────────
  { name: 'Barbell Curl',           muscleGroup: 'Arms',      equipment: 'Barbell' },
  { name: 'Dumbbell Curl',          muscleGroup: 'Arms',      equipment: 'Dumbbell' },
  { name: 'Hammer Curl',            muscleGroup: 'Arms',      equipment: 'Dumbbell' },
  { name: 'Cable Curl',             muscleGroup: 'Arms',      equipment: 'Cable' },
  { name: 'Preacher Curl',          muscleGroup: 'Arms',      equipment: 'Machine' },
  { name: 'Concentration Curl',     muscleGroup: 'Arms',      equipment: 'Dumbbell' },
  { name: 'Tricep Pushdown',        muscleGroup: 'Arms',      equipment: 'Cable' },
  { name: 'Skull Crusher',          muscleGroup: 'Arms',      equipment: 'Barbell' },
  { name: 'Overhead Tricep Ext.',   muscleGroup: 'Arms',      equipment: 'Dumbbell' },
  { name: 'Dips',                   muscleGroup: 'Arms',      equipment: 'Bodyweight' },
  { name: 'Close-Grip Bench',       muscleGroup: 'Arms',      equipment: 'Barbell' },
  // ── Core ───────────────────────────────────────
  { name: 'Plank',                  muscleGroup: 'Core',      equipment: 'Bodyweight' },
  { name: 'Crunch',                 muscleGroup: 'Core',      equipment: 'Bodyweight' },
  { name: 'Leg Raise',              muscleGroup: 'Core',      equipment: 'Bodyweight' },
  { name: 'Russian Twist',          muscleGroup: 'Core',      equipment: 'Bodyweight' },
  { name: 'Cable Crunch',           muscleGroup: 'Core',      equipment: 'Cable' },
  { name: 'Ab Wheel Rollout',       muscleGroup: 'Core',      equipment: 'Equipment' },
  { name: 'Hanging Leg Raise',      muscleGroup: 'Core',      equipment: 'Bodyweight' },
  { name: 'Side Plank',             muscleGroup: 'Core',      equipment: 'Bodyweight' },
  { name: 'Mountain Climber',       muscleGroup: 'Core',      equipment: 'Bodyweight' },
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

function daysAgo(n: number): string {
  const d = new Date()
  d.setDate(d.getDate() - n)
  return d.toISOString().split('T')[0]
}

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

function LastWeekSuggestion({
  lastWeekLog, todayExerciseNames, onAddAll, onAddOne,
}: {
  lastWeekLog: WorkoutLog | null
  todayExerciseNames: string[]
  onAddAll: (exercises: Exercise[]) => void
  onAddOne: (ex: Exercise) => void
}) {
  const [open, setOpen] = useState(false)
  if (!lastWeekLog || lastWeekLog.exercises.length === 0) return null
  const unmatched = lastWeekLog.exercises.filter(ex => !todayExerciseNames.includes(ex.name))
  if (unmatched.length === 0) return null

  return (
    <div className="mb-6 border border-paper-3 rounded-sm bg-pure-white overflow-hidden">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-paper transition-colors"
      >
        <div>
          <p className="font-mono text-2xs tracking-widest uppercase text-fog">Repeat from last {new Date(lastWeekLog.date + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'long' })}</p>
          <p className="font-sans text-xs text-ash mt-0.5">{lastWeekLog.name} · {lastWeekLog.exercises.length} exercises</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={e => { e.stopPropagation(); onAddAll(lastWeekLog.exercises) }}
            className="font-mono text-2xs px-3 py-1.5 bg-ink text-paper rounded-sm hover:bg-ink-3 transition-colors"
          >
            Copy All
          </button>
          <span className="font-mono text-lg text-fog">{open ? '−' : '+'}</span>
        </div>
      </button>

      {open && (
        <div className="border-t border-paper-3 divide-y divide-paper-3">
          {lastWeekLog.exercises.map(ex => {
            const already = todayExerciseNames.includes(ex.name)
            const best = maxW(ex)
            const vol = totalVol(ex)
            return (
              <button
                key={ex.id}
                onClick={() => !already && onAddOne(ex)}
                disabled={already}
                className={cn(
                  'w-full flex items-center justify-between px-4 py-2.5 text-left transition-colors',
                  already ? 'opacity-40 cursor-default' : 'hover:bg-paper cursor-pointer'
                )}
              >
                <div className="flex items-center gap-2">
                  <MuscleTag group={ex.muscleGroup} />
                  <span className="font-sans text-xs font-medium text-ink">{ex.name}</span>
                </div>
                <div className="text-right">
                  <p className="font-mono text-2xs text-ash">{best > 0 ? `${best}${ex.sets[0]?.unit}` : '—'}</p>
                  {vol > 0 && <p className="font-mono text-2xs text-fog">{vol} vol</p>}
                </div>
                <span className="font-mono text-sm text-fog ml-4">{already ? '✓' : '+'}</span>
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}

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

function ExercisePicker({
  alreadyAdded, onAdd, onClose,
}: {
  alreadyAdded: string[]
  onAdd: (def: ExerciseDef) => void
  onClose: () => void
}) {
  const [search, setSearch] = useState('')
  const [muscle, setMuscle] = useState('All')
  const [equipment, setEquipment] = useState('All')
  const [customName, setCustomName] = useState('')

  const results = useMemo(() => {
    return LIBRARY.filter(d => {
      const matchSearch = !search || d.name.toLowerCase().includes(search.toLowerCase())
      const matchMuscle = muscle === 'All' || d.muscleGroup === muscle
      const matchEquip  = equipment === 'All' || d.equipment === equipment
      return matchSearch && matchMuscle && matchEquip
    })
  }, [search, muscle, equipment])

  function addCustom() {
    if (!customName.trim()) return
    onAdd({ name: customName.trim(), muscleGroup: muscle !== 'All' ? muscle : 'Other', equipment: equipment !== 'All' ? equipment : 'Other' })
    setCustomName('')
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={onClose}>
      <div
        className="bg-pure-white border border-paper-3 rounded-md shadow-2xl w-full max-w-lg max-h-[80vh] flex flex-col overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        <div className="px-5 py-4 border-b border-paper-3 flex items-center justify-between">
          <p className="font-display font-bold text-sm text-ink">Exercise Library</p>
          <button onClick={onClose} className="font-mono text-lg text-fog hover:text-ink transition-colors">×</button>
        </div>

        <div className="px-5 pt-4 pb-3 border-b border-paper-3 space-y-3">
          <input
            autoFocus
            type="text"
            placeholder="Search exercises..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full font-sans text-sm bg-paper border border-smoke rounded-sm px-3 py-2 outline-none focus:border-ink transition-colors"
          />
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

        <div className="flex-1 overflow-y-auto px-5 py-3">
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
                      ? <span className="font-mono text-2xs text-fog flex-shrink-0 mt-0.5">✓</span>
                      : <span className="font-mono text-sm text-fog group-hover:text-paper flex-shrink-0">+</span>
                    }
                  </button>
                )
              })}
            </div>
          )}
        </div>

        <div className="px-5 py-3 border-t border-paper-3 flex gap-2">
          <input
            type="text"
            placeholder="Or add a custom exercise..."
            value={customName}
            onChange={e => setCustomName(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') addCustom() }}
            className="flex-1 font-sans text-sm bg-paper border border-smoke rounded-sm px-3 py-2 outline-none focus:border-ink transition-colors"
          />
          <Button size="sm" onClick={addCustom} disabled={!customName.trim()}>Add</Button>
        </div>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────
// FINISH WORKOUT MODAL
// ─────────────────────────────────────────────────────────────────

function FinishWorkoutModal({
  log,
  durationMins,
  onConfirm,
  onClose,
}: {
  log: WorkoutLog
  durationMins: number
  onConfirm: (effort: number, notes: string) => void
  onClose: () => void
}) {
  const [effort, setEffort] = useState(3)
  const [notes, setNotes] = useState(log.notes || '')

  const totalVolume = log.exercises.reduce((s, ex) => s + totalVol(ex), 0)
  const totalSets   = log.exercises.reduce((s, ex) => s + ex.sets.length, 0)
  const doneSets    = log.exercises.reduce((s, ex) => s + ex.sets.filter(set => set.done).length, 0)
  const muscleGroups = [...new Set(log.exercises.map(ex => ex.muscleGroup))]

  // Detect PRs: exercises where current max weight > 0 (simplified — would compare vs history in a full impl)
  const prs = log.exercises.filter(ex => {
    const best = maxW(ex)
    return best > 0 && ex.sets.some(s => s.done)
  })

  const effortLabels: Record<number, string> = {
    1: 'Easy',
    2: 'Moderate',
    3: 'Good',
    4: 'Hard',
    5: 'Max effort',
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <div
        className="bg-pure-white border border-paper-3 rounded-md shadow-2xl w-full max-w-md overflow-hidden animate-fade-up"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-5 bg-ink text-paper">
          <p className="font-mono text-2xs tracking-widest uppercase text-white/40 mb-1">Workout Complete</p>
          <p className="font-display font-bold text-xl">{log.name}</p>
        </div>

        {/* Stats summary */}
        <div className="grid grid-cols-3 divide-x divide-paper-3 border-b border-paper-3">
          <div className="px-5 py-4 text-center">
            <p className="font-display font-bold text-2xl text-ink">{durationMins}<span className="text-sm font-sans text-fog ml-1">min</span></p>
            <p className="font-mono text-2xs text-fog uppercase tracking-widest mt-0.5">Duration</p>
          </div>
          <div className="px-5 py-4 text-center">
            <p className="font-display font-bold text-2xl text-ink">{doneSets}<span className="text-sm font-sans text-fog ml-1">sets</span></p>
            <p className="font-mono text-2xs text-fog uppercase tracking-widest mt-0.5">{totalSets > doneSets ? `${totalSets - doneSets} skipped` : 'All done'}</p>
          </div>
          <div className="px-5 py-4 text-center">
            <p className="font-display font-bold text-2xl text-ink">{totalVolume > 0 ? (totalVolume >= 1000 ? `${(totalVolume / 1000).toFixed(1)}k` : totalVolume) : '—'}</p>
            <p className="font-mono text-2xs text-fog uppercase tracking-widest mt-0.5">Volume</p>
          </div>
        </div>

        <div className="px-6 py-5 space-y-5">
          {/* Muscles worked */}
          {muscleGroups.length > 0 && (
            <div>
              <p className="font-mono text-2xs tracking-widest uppercase text-fog mb-2">Muscles Worked</p>
              <div className="flex flex-wrap gap-1.5">
                {muscleGroups.map(g => <MuscleTag key={g} group={g} />)}
              </div>
            </div>
          )}

          {/* PRs */}
          {prs.length > 0 && (
            <div className="px-4 py-3 bg-amber-50 border border-amber-200 rounded-sm">
              <p className="font-mono text-2xs tracking-widest uppercase text-amber-600 mb-1.5">Personal Records</p>
              <div className="flex flex-wrap gap-2">
                {prs.map(ex => (
                  <span key={ex.id} className="font-sans text-xs font-medium text-amber-700">
                    ↑ {ex.name} — {maxW(ex)}{ex.sets[0]?.unit}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Effort rating */}
          <div>
            <p className="font-mono text-2xs tracking-widest uppercase text-fog mb-2">
              Effort — <span className="text-ink normal-case">{effortLabels[effort]}</span>
            </p>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map(n => (
                <button
                  key={n}
                  onClick={() => setEffort(n)}
                  className={cn(
                    'flex-1 py-2.5 rounded-sm border font-mono text-sm font-bold transition-all duration-150',
                    effort >= n
                      ? 'bg-ink text-paper border-ink'
                      : 'bg-transparent text-fog border-smoke hover:border-ash'
                  )}
                >
                  {n}
                </button>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div>
            <p className="font-mono text-2xs tracking-widest uppercase text-fog mb-2">Notes</p>
            <textarea
              rows={2}
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="How did it feel? Anything to remember..."
              className="w-full font-sans text-sm bg-paper border border-smoke rounded-sm px-3 py-2.5 outline-none focus:border-ink transition-colors resize-none placeholder:text-fog"
            />
          </div>
        </div>

        {/* Actions */}
        <div className="px-6 pb-6 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-3 font-mono text-2xs tracking-widest uppercase text-fog border border-smoke rounded-sm hover:border-ink hover:text-ink transition-all"
          >
            Keep Going
          </button>
          <button
            onClick={() => onConfirm(effort, notes)}
            className="flex-1 py-3 font-mono text-2xs tracking-widest uppercase bg-ink text-paper rounded-sm hover:bg-ink-2 transition-all font-bold"
          >
            Save Workout
          </button>
        </div>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────
// WORKOUT SAVED BANNER
// ─────────────────────────────────────────────────────────────────

function WorkoutSavedBanner({ log, onReopen }: { log: WorkoutLog; onReopen: () => void }) {
  const totalVolume = log.exercises.reduce((s, ex) => s + totalVol(ex), 0)
  const muscleGroups = [...new Set(log.exercises.map(ex => ex.muscleGroup))]
  const effortLabels: Record<number, string> = { 1: 'Easy', 2: 'Moderate', 3: 'Good', 4: 'Hard', 5: 'Max effort' }

  return (
    <div className="px-14 py-8 max-w-3xl">
      <div className="border border-success-border bg-success-bg rounded-sm px-6 py-5 mb-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="font-mono text-2xs tracking-widest uppercase text-success mb-1">✓ Workout Saved</p>
            <p className="font-display font-bold text-lg text-ink">{log.name}</p>
            <div className="flex items-center gap-3 mt-1.5">
              <span className="font-mono text-2xs text-fog">{log.durationMins}m</span>
              <span className="font-mono text-2xs text-fog">·</span>
              <span className="font-mono text-2xs text-fog">{log.exercises.length} exercises</span>
              {totalVolume > 0 && <>
                <span className="font-mono text-2xs text-fog">·</span>
                <span className="font-mono text-2xs text-fog">{totalVolume} vol</span>
              </>}
              {log.effort && <>
                <span className="font-mono text-2xs text-fog">·</span>
                <span className="font-mono text-2xs text-fog">{effortLabels[log.effort]}</span>
              </>}
            </div>
            {muscleGroups.length > 0 && (
              <div className="flex gap-1.5 mt-3 flex-wrap">
                {muscleGroups.map(g => <MuscleTag key={g} group={g} />)}
              </div>
            )}
            {log.notes && (
              <p className="font-sans text-xs text-ash italic mt-3 leading-relaxed">{log.notes}</p>
            )}
          </div>
        </div>
      </div>

      <button
        onClick={onReopen}
        className="font-mono text-2xs tracking-widest uppercase text-fog border border-smoke px-4 py-2.5 rounded-sm hover:border-ink hover:text-ink transition-all"
      >
        Edit Workout
      </button>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────
// MAIN WORKOUT PAGE
// ─────────────────────────────────────────────────────────────────

export default function WorkoutPage() {
  const today = new Date(Date.now() - new Date().getTimezoneOffset() * 60000).toISOString().split('T')[0]

  const [logs, setLogsState] = useState<WorkoutLog[]>(() => loadLogs())
  const [view, setView] = useState<'log' | 'history'>('log')
  const [showPicker, setShowPicker] = useState(false)
  const [showFinishModal, setShowFinishModal] = useState(false)
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

  const lastWeekLog = useMemo(() => {
    const todayDate = new Date(today)
    const todayWeekday = todayDate.getDay()
    for (let offset = 7; offset <= 14; offset++) {
      const candidate = daysAgo(offset)
      const candidateWeekday = new Date(candidate).getDay()
      if (candidateWeekday === todayWeekday) {
        const found = logs.find(l => l.date === candidate)
        if (found && found.exercises.length > 0) return found
      }
    }
    for (let offset = 1; offset <= 14; offset++) {
      const candidate = daysAgo(offset)
      const found = logs.find(l => l.date === candidate)
      if (found && found.exercises.length > 0) return found
    }
    return null
  }, [logs, today])

  const recentExercises = useMemo(() => getRecentExercises(logs, today), [logs, today])

  function getLastLog(name: string): Exercise | null {
    for (const log of pastLogs) {
      const f = log.exercises.find(ex => ex.name.toLowerCase() === name.toLowerCase())
      if (f) return f
    }
    return null
  }

  function upsertToday(updated: WorkoutLog) {
    persistLogs(
      logs.some(l => l.date === today)
        ? logs.map(l => l.date === today ? updated : l)
        : [...logs, updated]
    )
  }

  function addExercise(def: ExerciseDef) {
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

  function addFromLastWeek(lastEx: Exercise) {
    if (todayLog.exercises.some(e => e.name === lastEx.name)) return
    const ex: Exercise = {
      id: Date.now().toString() + Math.random(),
      name: lastEx.name,
      muscleGroup: lastEx.muscleGroup,
      equipment: lastEx.sets[0] ? lastEx.muscleGroup : 'Other',
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

  // ── FINISH WORKOUT ────────────────────────────────────────────
  function handleFinish(effort: number, notes: string) {
    const durationMins = Math.max(1, Math.floor((Date.now() - startTime) / 60000))
    const finished: WorkoutLog = {
      ...todayLog,
      durationMins,
      effort,
      notes,
      completed: true,
      completedAt: new Date().toISOString(),
    }
    persistLogs(
      logs.some(l => l.date === today)
        ? logs.map(l => l.date === today ? finished : l)
        : [...logs, finished]
    )
    setShowFinishModal(false)
  }

  function handleReopen() {
    // Mark as not completed so the log UI reappears
    upsertToday({ ...todayLog, completed: false })
  }

  const elapsed = Math.max(1, Math.floor((Date.now() - startTime) / 60000))
  const todayExerciseNames = todayLog.exercises.map(e => e.name)
  const totalSetsLogged = todayLog.exercises.reduce((s, ex) => s + ex.sets.length, 0)
  const doneSets = todayLog.exercises.reduce((s, ex) => s + ex.sets.filter(set => set.done).length, 0)
  const isCompleted = !!todayLog.completed

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
        <>
          {/* If workout is completed — show saved banner */}
          {isCompleted ? (
            <WorkoutSavedBanner log={todayLog} onReopen={handleReopen} />
          ) : (
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

              {/* Recent exercises */}
              <RecentExercises
                recents={recentExercises}
                todayExerciseNames={todayExerciseNames}
                onAdd={addExercise}
              />

              {/* Exercise cards */}
              <div className="flex flex-col gap-4 mb-6">
                {todayLog.exercises.map(ex => (
                  <ExerciseCard
                    key={ex.id}
                    ex={ex}
                    lastEx={getLastLog(ex.name)}
                    onUpdateSet={(si, field, value) => updateSet(ex.id, si, field, value)}
                    onAddSet={() => addSet(ex.id)}
                    onRemoveSet={si => removeSet(ex.id, si)}
                    onRemove={() => removeExercise(ex.id)}
                  />
                ))}
              </div>

              {/* Action row */}
              <div className={cn(
                'flex gap-3',
                todayLog.exercises.length > 0 ? 'justify-between items-center' : 'justify-start'
              )}>
                <Button variant="outline" onClick={() => setShowPicker(true)}>
                  + Add Exercise
                </Button>

                {todayLog.exercises.length > 0 && (
                  <button
                    onClick={() => setShowFinishModal(true)}
                    className="px-6 py-3 bg-ink text-paper font-mono text-2xs tracking-widest uppercase rounded-sm hover:bg-ink-2 transition-all duration-150 font-bold"
                  >
                    Finish Workout
                  </button>
                )}
              </div>

              {/* Empty state */}
              {todayLog.exercises.length === 0 && (
                <div className="text-center py-20 border border-dashed border-smoke rounded-sm mt-6">
                  <p className="font-display italic text-base text-fog mb-1">
                    {lastWeekLog
                      ? `Last ${new Date(lastWeekLog.date + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'long' })} you did ${lastWeekLog.exercises.length} exercises. Copy them above or add new ones.`
                      : 'Add your first exercise to start logging.'}
                  </p>
                  <Button size="sm" onClick={() => setShowPicker(true)}>Browse Library</Button>
                </div>
              )}
            </div>
          )}
        </>
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
                const effortLabels: Record<number, string> = { 1: 'Easy', 2: 'Moderate', 3: 'Good', 4: 'Hard', 5: 'Max effort' }

                return (
                  <Card key={log.date} className="overflow-hidden p-0">
                    <div className="px-5 py-4 bg-paper border-b border-paper-3 flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2 mb-0.5">
                          <p className="font-display font-bold text-sm text-ink">{log.name || 'Workout'}</p>
                          {log.completed && (
                            <span className="font-mono text-2xs px-1.5 py-0.5 bg-success-bg text-success border border-success-border rounded-sm">✓ Saved</span>
                          )}
                        </div>
                        <p className="font-mono text-2xs text-fog mt-0.5">
                          {new Date(log.date + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                          {' · '}{log.exercises.length} exercises · {tSets} sets
                          {tVol > 0 && ` · ${tVol} vol`}
                          {log.durationMins && ` · ${log.durationMins}m`}
                          {log.effort && ` · ${effortLabels[log.effort]}`}
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
                                <span key={si} className={cn(
                                  'font-mono text-2xs px-2 py-0.5 rounded-sm border',
                                  set.done ? 'bg-ink/[0.04] border-ink/10 text-ink' : 'bg-paper border-paper-3 text-fog'
                                )}>
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

      {/* ── MODALS ──────────────────────────────────── */}
      {showPicker && (
        <ExercisePicker
          alreadyAdded={todayExerciseNames}
          onAdd={addExercise}
          onClose={() => setShowPicker(false)}
        />
      )}

      {showFinishModal && (
        <FinishWorkoutModal
          log={todayLog}
          durationMins={elapsed}
          onConfirm={handleFinish}
          onClose={() => setShowFinishModal(false)}
        />
      )}
    </div>
  )
}
