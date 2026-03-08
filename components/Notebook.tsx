'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import type React from 'react'
import { DayData, DAYS, MONTHS, CORE_TASKS } from '@/types'

interface NotebookProps {
  entries: DayData[]
}

function fmt(dateKey: string) {
  const [year, month, day] = dateKey.split('-').map(Number)
  const d = new Date(year, month - 1, day)
  return { dayName: DAYS[d.getDay()], monthName: MONTHS[month - 1], day, year }
}

function Field({ label, value, italic }: { label: string; value?: string; italic?: boolean }) {
  if (!value) return null
  const lines = value.split('\n').filter((l: string) => l.trim())
  const textStyle: React.CSSProperties = {
    fontFamily: "'Times New Roman', Times, serif",
    fontSize: '1.05rem',
    lineHeight: 2,
    color: '#1e1e1e',
    fontStyle: italic ? 'italic' : 'normal',
  }
  return (
    <div style={{ marginBottom: 24 }}>
      <div style={{
        fontFamily: 'var(--font-mono)', fontSize: '0.52rem', letterSpacing: '0.14em',
        textTransform: 'uppercase', color: '#a8a8a8', marginBottom: 7,
        borderBottom: '1px solid #edeae3', paddingBottom: 4,
      }}>
        {label}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {lines.map((line: string, i: number) => (
          <div key={i} style={textStyle}>{line}</div>
        ))}
      </div>
    </div>
  )
}

// ── Page content (shared between displayed and incoming) ──
function PageLeft({ entry }: { entry: DayData }) {
  const { dayName, monthName, day, year } = fmt(entry.date_key)
  const done = Object.values(entry.tasks || {}).filter(Boolean).length
  const total = CORE_TASKS.length
  const completion = Math.round((done / total) * 100)
  const ruledBg = `repeating-linear-gradient(to bottom, transparent, transparent 33px, rgba(0,0,0,0.05) 33px, rgba(0,0,0,0.05) 34px)`

  return (
    <div style={{ position: 'relative', height: '100%', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', inset: 0, backgroundImage: ruledBg, backgroundPosition: '0 60px', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', left: 50, top: 0, bottom: 0, width: 1, background: 'rgba(180,60,60,0.15)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', left: 12, top: 0, bottom: 0, display: 'flex', flexDirection: 'column', justifyContent: 'space-evenly', padding: '50px 0', pointerEvents: 'none' }}>
        {[0,1,2].map(i => <div key={i} style={{ width: 15, height: 15, borderRadius: '50%', background: '#eae7e0', border: '1px solid #d0cdc5', boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.14)' }} />)}
      </div>
      <div style={{ position: 'relative', zIndex: 1, padding: '30px 26px 24px 58px', height: '100%', overflowY: 'auto' }}>
        <div style={{ marginBottom: 22, paddingBottom: 18, borderBottom: '2px solid #0a0a0a' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.7rem', fontWeight: 700, color: '#0a0a0a', letterSpacing: '-0.02em', lineHeight: 1.1 }}>{dayName}</div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.64rem', color: '#888', marginTop: 4, letterSpacing: '0.06em' }}>{monthName} {day}, {year}</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.9rem', fontWeight: 700, color: completion >= 100 ? '#0a0a0a' : '#c8c8c8', letterSpacing: '-0.03em', lineHeight: 1 }}>{completion}%</div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.52rem', color: '#b8b8b8', letterSpacing: '0.06em' }}>{done} of {total}</div>
            </div>
          </div>
          {(entry.focus1 || entry.focus2 || entry.focus3) && (
            <div style={{ marginTop: 14 }}>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.5rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: '#b0b0b0', marginBottom: 7 }}>1% Focus</div>
              {[entry.focus1, entry.focus2, entry.focus3].filter(Boolean).map((f, i) => (
                <div key={i} style={{ fontFamily: 'var(--font-body)', fontSize: '0.85rem', color: '#2a2a2a', lineHeight: 1.8 }}>{i + 1}. {f}</div>
              ))}
            </div>
          )}
        </div>
        <Field label="Morning Journal" value={entry.journal_main} italic />
        <Field label="Intentions" value={entry.journal_intentions} />
        <Field label="Stoic Meditation" value={entry.journal_stoic} />
        <Field label="Business Learning" value={entry.journal_business} />
        <Field label="Reading Notes" value={entry.journal_reading} />
      </div>
    </div>
  )
}

function PageRight({ entry }: { entry: DayData }) {
  const ruledBg = `repeating-linear-gradient(to bottom, transparent, transparent 33px, rgba(0,0,0,0.05) 33px, rgba(0,0,0,0.05) 34px)`
  const rightSections = [
    { label: "Today's Thought", value: entry.ref_thought },
    { label: 'What Went Well', value: entry.ref_went_well },
    { label: "Today's Win", value: entry.ref_big_win },
    { label: 'What I Learned', value: entry.ref_learned },
    { label: "Tomorrow's Intention", value: entry.ref_tomorrow },
    { label: 'Gratitude', value: entry.ref_gratitude },
  ]
  return (
    <div style={{ position: 'relative', height: '100%', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', inset: 0, backgroundImage: ruledBg, backgroundPosition: '0 60px', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', right: 12, top: 0, bottom: 0, display: 'flex', flexDirection: 'column', justifyContent: 'space-evenly', padding: '50px 0', pointerEvents: 'none' }}>
        {[0,1,2].map(i => <div key={i} style={{ width: 15, height: 15, borderRadius: '50%', background: '#f8f7f4', border: '1px solid #ece9e2', boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.1)' }} />)}
      </div>
      <div style={{ position: 'relative', zIndex: 1, padding: '30px 40px 24px 24px', height: '100%', overflowY: 'auto' }}>
        <div style={{ marginBottom: 22, paddingBottom: 18, borderBottom: '2px solid #0a0a0a' }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.52rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: '#b0b0b0', marginBottom: 10 }}>Daily Disciplines</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {CORE_TASKS.map(t => (
              <span key={t.id} style={{ fontFamily: 'var(--font-mono)', fontSize: '0.54rem', letterSpacing: '0.05em', textTransform: 'uppercase', padding: '4px 10px', border: `1px solid ${entry.tasks?.[t.id] ? '#0a0a0a' : '#e2dfd8'}`, color: entry.tasks?.[t.id] ? '#0a0a0a' : '#c4c1ba', background: entry.tasks?.[t.id] ? 'rgba(10,10,10,0.05)' : 'transparent', borderRadius: 1 }}>
                {entry.tasks?.[t.id] ? '✓ ' : ''}{t.name}
              </span>
            ))}
          </div>
          {(entry.todos || []).length > 0 && (
            <div style={{ marginTop: 14 }}>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.5rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: '#c0c0c0', marginBottom: 7 }}>Extra Tasks</div>
              {(entry.todos || []).map((t, i) => (
                <div key={i} style={{ fontFamily: 'var(--font-body)', fontSize: '0.85rem', color: t.done ? '#c0c0c0' : '#2a2a2a', textDecoration: t.done ? 'line-through' : 'none', lineHeight: 1.9 }}>
                  {t.done ? '✓' : '–'} {t.text}
                </div>
              ))}
            </div>
          )}
        </div>
        {rightSections.map(s => <Field key={s.label} {...s} />)}
        {rightSections.every(s => !s.value) && (
          <div style={{ fontFamily: 'var(--font-body)', fontSize: '0.92rem', color: '#d0d0d0', fontStyle: 'italic', paddingTop: 8 }}>No reflection written for this day.</div>
        )}
      </div>
    </div>
  )
}

// ── Animation phases ──
// 'idle' → 'lift' (page rises/tilts slightly) → 'sweep' (full rotate past 90°) → 'land' (settle into place)
type Phase = 'idle' | 'lift' | 'sweep' | 'land'

export default function Notebook({ entries }: NotebookProps) {
  const [idx, setIdx] = useState(0)
  const [phase, setPhase] = useState<Phase>('idle')
  const [dir, setDir] = useState<'next' | 'prev'>('next')
  // pendingIdx is what will be shown after the flip midpoint
  const [displayIdx, setDisplayIdx] = useState(0)
  const timers = useRef<NodeJS.Timeout[]>([])

  function clearTimers() { timers.current.forEach(clearTimeout); timers.current = [] }

  const navigate = useCallback((direction: 'next' | 'prev') => {
    if (phase !== 'idle') return
    if (direction === 'next' && idx >= entries.length - 1) return
    if (direction === 'prev' && idx <= 0) return

    clearTimers()
    setDir(direction)
    const nextIdx = direction === 'next' ? idx + 1 : idx - 1

    // Phase 1: lift — page peels up gently (0–120ms)
    setPhase('lift')

    // Phase 2: sweep — page blurs past at speed (120–480ms)
    timers.current.push(setTimeout(() => {
      setPhase('sweep')
    }, 120))

    // Swap content exactly at midpoint of sweep
    timers.current.push(setTimeout(() => {
      setIdx(nextIdx)
      setDisplayIdx(nextIdx)
    }, 300))

    // Phase 3: land — page settles with slight overshoot (480–700ms)
    timers.current.push(setTimeout(() => {
      setPhase('land')
    }, 480))

    // Done
    timers.current.push(setTimeout(() => {
      setPhase('idle')
    }, 700))
  }, [phase, idx, entries.length])

  useEffect(() => () => clearTimers(), [])

  const handleKey = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'ArrowRight') navigate('next')
    if (e.key === 'ArrowLeft') navigate('prev')
  }, [navigate])

  const entry = entries[displayIdx]

  if (!entry) {
    return (
      <div style={{ textAlign: 'center', padding: '100px 40px', color: '#b0b0b0', fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: '1.1rem' }}>
        No entries yet. Start writing today.
      </div>
    )
  }

  // ── Compute right-page transform per phase ──
  // Netflix-style: ease in slow, rip through center fast, ease out with tiny overshoot
  function getRightTransform(): string {
    const p = 'perspective(1800px)'
    if (phase === 'idle') return `${p} rotateY(0deg)`
    if (dir === 'next') {
      if (phase === 'lift')  return `${p} rotateY(-8deg) translateZ(6px)`
      if (phase === 'sweep') return `${p} rotateY(-185deg)`  // past 180 for overshoot
      if (phase === 'land')  return `${p} rotateY(-178deg)`  // settle back
      return `${p} rotateY(-180deg)`
    } else {
      // prev: page comes from behind
      if (phase === 'lift')  return `${p} rotateY(8deg) translateZ(6px)`
      if (phase === 'sweep') return `${p} rotateY(185deg)`
      if (phase === 'land')  return `${p} rotateY(178deg)`
      return `${p} rotateY(180deg)`
    }
  }

  function getRightTransition(): string {
    if (phase === 'idle') return 'transform 0.25s ease'
    if (phase === 'lift') return 'transform 0.12s cubic-bezier(0.25, 0.1, 0.25, 1)'
    if (phase === 'sweep') return 'transform 0.36s cubic-bezier(0.55, 0, 0.45, 1)'  // fast, linear center
    if (phase === 'land') return 'transform 0.22s cubic-bezier(0.34, 1.56, 0.64, 1)' // springy settle
    return 'none'
  }

  // Shadow intensifies during sweep, fades on land
  function getRightShadow(): string {
    if (phase === 'sweep') return '-20px 0 60px rgba(0,0,0,0.35), 0 0 40px rgba(0,0,0,0.2)'
    if (phase === 'lift')  return '-8px 0 30px rgba(0,0,0,0.18)'
    return '8px 8px 28px rgba(0,0,0,0.08)'
  }

  // Left page subtly reacts — pulls back when right page sweeps
  function getLeftTransform(): string {
    if (phase === 'sweep') return 'perspective(1800px) rotateY(2deg) translateZ(-4px)'
    if (phase === 'land')  return 'perspective(1800px) rotateY(0deg)'
    return 'perspective(1800px) rotateY(0deg)'
  }

  function getLeftTransition(): string {
    if (phase === 'sweep') return 'transform 0.36s cubic-bezier(0.55, 0, 0.45, 1)'
    return 'transform 0.22s ease'
  }

  // Overlay that darkens the left page slightly during flip (depth effect)
  const showOverlay = phase === 'sweep'

  const ruledBg = `repeating-linear-gradient(to bottom, transparent, transparent 33px, rgba(0,0,0,0.05) 33px, rgba(0,0,0,0.05) 34px)`

  const pageBase: React.CSSProperties = {
    position: 'absolute', top: 0, bottom: 0,
    width: 'calc(50% - 12px)',
    overflow: 'hidden',
    border: '1px solid #e2dfd8',
  }

  return (
    <div
      style={{ padding: '44px 80px 52px', background: '#eae7e0', minHeight: 700, display: 'flex', flexDirection: 'column', alignItems: 'center', outline: 'none', userSelect: 'none' }}
      tabIndex={0}
      onKeyDown={handleKey}
    >
      {/* Counter */}
      <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.58rem', letterSpacing: '0.14em', textTransform: 'uppercase', color: '#a0a0a0', marginBottom: 28 }}>
        {displayIdx + 1} / {entries.length} &nbsp;·&nbsp; arrow keys or click to navigate
      </div>

      {/* Book */}
      <div style={{ position: 'relative', width: '100%', maxWidth: 940, height: 600 }}>

        {/* Right depth stack */}
        {idx < entries.length - 1 && (<>
          <div style={{ position: 'absolute', right: -9, top: 9, bottom: 9, width: 'calc(50% - 12px)', background: '#ccc9c0', borderRadius: '0 7px 7px 0', zIndex: 0 }} />
          <div style={{ position: 'absolute', right: -5, top: 5, bottom: 5, width: 'calc(50% - 12px)', background: '#d8d5cc', borderRadius: '0 6px 6px 0', zIndex: 0 }} />
        </>)}

        {/* Left depth stack */}
        {idx > 0 && (<>
          <div style={{ position: 'absolute', left: -9, top: 9, bottom: 9, width: 'calc(50% - 12px)', background: '#ccc9c0', borderRadius: '7px 0 0 7px', zIndex: 0 }} />
          <div style={{ position: 'absolute', left: -5, top: 5, bottom: 5, width: 'calc(50% - 12px)', background: '#d8d5cc', borderRadius: '6px 0 0 6px', zIndex: 0 }} />
        </>)}

        {/* Spine */}
        <div style={{
          position: 'absolute', left: '50%', top: 0, bottom: 0, width: 24,
          transform: 'translateX(-50%)',
          background: 'linear-gradient(90deg, #0e0e0e 0%, #2e2e2e 40%, #1a1a1a 60%, #0e0e0e 100%)',
          zIndex: 20,
          boxShadow: '-5px 0 18px rgba(0,0,0,0.4), 5px 0 18px rgba(0,0,0,0.3)',
        }} />

        {/* ── LEFT PAGE ── */}
        <div style={{
          ...pageBase,
          left: 0,
          background: '#faf9f5',
          borderRight: 'none',
          borderRadius: '5px 0 0 5px',
          boxShadow: '-8px 8px 30px rgba(0,0,0,0.12)',
          zIndex: 10,
          transform: getLeftTransform(),
          transition: getLeftTransition(),
          transformOrigin: 'right center',
        }}>
          <PageLeft entry={entry} />
          {/* Depth overlay during flip */}
          <div style={{
            position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 50,
            background: 'rgba(0,0,0,0)',
            transition: 'background 0.36s ease',
            ...(showOverlay ? { background: 'rgba(0,0,0,0.06)' } : {}),
          }} />
        </div>

        {/* ── RIGHT PAGE (the one that flips) ── */}
        <div style={{
          ...pageBase,
          right: 0,
          background: '#ffffff',
          borderLeft: 'none',
          borderRadius: '0 7px 7px 0',
          zIndex: phase === 'idle' ? 10 : 15,
          transformOrigin: 'left center',
          transform: getRightTransform(),
          transition: getRightTransition(),
          boxShadow: getRightShadow(),
          // Backface hidden so we don't see through during flip
          backfaceVisibility: 'hidden',
        }}>
          <PageRight entry={entry} />

          {/* Leading-edge curl gradient — appears during sweep */}
          <div style={{
            position: 'absolute', right: 0, top: 0, bottom: 0, width: 40,
            background: 'linear-gradient(to left, rgba(0,0,0,0.14), transparent)',
            pointerEvents: 'none', zIndex: 5,
            opacity: phase === 'sweep' ? 1 : 0,
            transition: 'opacity 0.15s ease',
          }} />
        </div>

        {/* ── Nav arrows ── */}
        {idx > 0 && (
          <button
            onClick={() => navigate('prev')}
            style={{ position: 'absolute', left: -22, top: '50%', transform: 'translateY(-50%)', width: 44, height: 44, borderRadius: '50%', background: '#0a0a0a', color: '#f8f7f4', border: 'none', cursor: phase !== 'idle' ? 'default' : 'pointer', fontSize: '16px', zIndex: 30, boxShadow: '0 4px 16px rgba(0,0,0,0.25)', transition: 'transform 0.15s, background 0.15s, opacity 0.2s', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: phase !== 'idle' ? 0.4 : 1 }}
            onMouseEnter={e => { if (phase === 'idle') { e.currentTarget.style.transform = 'translateY(-50%) scale(1.12)'; e.currentTarget.style.background = '#333' } }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(-50%) scale(1)'; e.currentTarget.style.background = '#0a0a0a' }}
          >←</button>
        )}
        {idx < entries.length - 1 && (
          <button
            onClick={() => navigate('next')}
            style={{ position: 'absolute', right: -22, top: '50%', transform: 'translateY(-50%)', width: 44, height: 44, borderRadius: '50%', background: '#0a0a0a', color: '#f8f7f4', border: 'none', cursor: phase !== 'idle' ? 'default' : 'pointer', fontSize: '16px', zIndex: 30, boxShadow: '0 4px 16px rgba(0,0,0,0.25)', transition: 'transform 0.15s, background 0.15s, opacity 0.2s', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: phase !== 'idle' ? 0.4 : 1 }}
            onMouseEnter={e => { if (phase === 'idle') { e.currentTarget.style.transform = 'translateY(-50%) scale(1.12)'; e.currentTarget.style.background = '#333' } }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(-50%) scale(1)'; e.currentTarget.style.background = '#0a0a0a' }}
          >→</button>
        )}
      </div>
    </div>
  )
}
