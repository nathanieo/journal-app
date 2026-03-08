'use client'

import { useApp } from '../AppContext'
import { MONTHS, DAYS } from '@/types'
import { useState, useEffect, useRef } from 'react'
import { PageHeader } from '../ui/page-header'
import { Card, CardHeader, CardContent, CardTitle } from '../ui/card'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Progress, progressHex } from '../ui/progress'
import { Checkbox } from '../ui/checkbox'
import { Badge } from '../ui/badge'
import { Separator } from '../ui/separator'
import { cn } from '@/lib/utils'

// ─────────────────────────────────────────────
// CALENDAR
// ─────────────────────────────────────────────
interface TimeBlock { id: string; hour: number; duration: number; label: string }

export function CalendarPage() {
  const { allDays } = useApp()
  const now = new Date()
  const [offset, setOffset] = useState(0)
  const [view, setView] = useState<'month' | 'day'>('month')
  const [selectedDay, setSelectedDay] = useState<string | null>(null)
  const [blocks, setBlocks] = useState<Record<string, TimeBlock[]>>(() => {
    try { return JSON.parse(localStorage.getItem('timeblocks') || '{}') } catch { return {} }
  })
  const [newBlock, setNewBlock] = useState({ hour: 9, duration: 1, label: '' })
  const [showAdd, setShowAdd] = useState(false)

  const viewDate = new Date(now.getFullYear(), now.getMonth() + offset, 1)
  const month = viewDate.getMonth()
  const year = viewDate.getFullYear()
  const firstDay = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const cells: (number | null)[] = [...Array(firstDay).fill(null), ...Array.from({ length: daysInMonth }, (_, i) => i + 1)]
  const HOURS = Array.from({ length: 18 }, (_, i) => i + 6)

  function saveBlocks(updated: Record<string, TimeBlock[]>) {
    setBlocks(updated); localStorage.setItem('timeblocks', JSON.stringify(updated))
  }
  function addBlock() {
    if (!selectedDay || !newBlock.label.trim()) return
    const updated = { ...blocks, [selectedDay]: [...(blocks[selectedDay] || []), { id: Date.now().toString(), ...newBlock }] }
    saveBlocks(updated); setNewBlock({ hour: 9, duration: 1, label: '' }); setShowAdd(false)
  }
  function deleteBlock(dateKey: string, id: string) {
    saveBlocks({ ...blocks, [dateKey]: (blocks[dateKey] || []).filter(b => b.id !== id) })
  }

  return (
    <div className="animate-fade-up">
      <PageHeader title="Calendar" subtitle={`${MONTHS[month]} ${year}`}>
        <div className="flex border border-smoke rounded-sm overflow-hidden">
          {(['month', 'day'] as const).map(v => (
            <button key={v} onClick={() => setView(v)}
              className={cn('px-4 py-2 font-mono text-2xs tracking-widest uppercase cursor-pointer transition-all duration-150',
                view === v ? 'bg-ink text-paper' : 'bg-transparent text-ash hover:bg-paper-3')}>
              {v}
            </button>
          ))}
        </div>
        <Button variant="ghost" size="sm" onClick={() => setOffset(o => o - 1)}>Prev</Button>
        <Button variant="ghost" size="sm" onClick={() => setOffset(0)}>Today</Button>
        <Button variant="ghost" size="sm" onClick={() => setOffset(o => o + 1)}>Next</Button>
      </PageHeader>

      <div className={cn('px-14 pt-9 pb-14 grid gap-8', selectedDay ? 'grid-cols-[1fr_340px]' : 'grid-cols-1')}>
        <div>
          <div className="grid grid-cols-7 gap-0.5 mb-2">
            {DAYS.map(d => (
              <div key={d} className="font-mono text-2xs tracking-widest uppercase text-fog text-center py-2">{d.slice(0,3)}</div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-0.5">
            {cells.map((day, i) => {
              if (!day) return <div key={i} />
              const key = `${year}-${String(month+1).padStart(2,'0')}-${String(day).padStart(2,'0')}`
              const entry = allDays[key]
              const done = entry ? Object.values(entry.tasks || {}).filter(Boolean).length : 0
              const pct = done / 6
              const isToday = key === now.toISOString().split('T')[0]
              const isSel = key === selectedDay
              return (
                <button key={i} onClick={() => { setSelectedDay(key); setView('day') }}
                  className={cn(
                    'aspect-square flex flex-col items-center justify-center gap-1 rounded-sm cursor-pointer transition-all duration-150',
                    'border hover:border-ink focus-visible:outline-none',
                    isSel ? 'border-ink bg-ink/5' : isToday ? 'border-ash' : 'border-paper-3 bg-pure-white',
                  )}>
                  <span className={cn('font-sans text-sm', isToday ? 'font-bold text-ink' : pct > 0 ? 'text-ink' : 'text-fog')}>{day}</span>
                  {entry && <div className="w-[18px] h-0.5 rounded-full" style={{ background: pct >= 1 ? '#1a7a3a' : `rgba(10,10,10,${0.25 + pct * 0.5})` }} />}
                  {(blocks[key] || []).length > 0 && <div className="w-1 h-1 rounded-full bg-ash" />}
                </button>
              )
            })}
          </div>
        </div>

        {selectedDay && (
          <Card className="overflow-hidden p-0">
            <div className="px-5 py-4 border-b border-paper-3 flex items-center justify-between">
              <div>
                <p className="font-display font-bold text-base text-ink">{selectedDay}</p>
                <p className="font-mono text-2xs text-fog mt-0.5">{(blocks[selectedDay] || []).length} time blocks</p>
              </div>
              <Button size="sm" onClick={() => setShowAdd(v => !v)}>+ Block</Button>
            </div>

            {showAdd && (
              <div className="px-5 py-4 bg-paper border-b border-paper-3 flex flex-col gap-3">
                <Input placeholder="Block label (e.g. Study, Gym)" value={newBlock.label}
                  onChange={e => setNewBlock(p => ({ ...p, label: e.target.value }))}
                  onKeyDown={e => e.key === 'Enter' && addBlock()} />
                <div className="flex gap-3">
                  <div className="flex-1">
                    <p className="font-mono text-2xs text-fog mb-1 tracking-widest uppercase">Start</p>
                    <select value={newBlock.hour} onChange={e => setNewBlock(p => ({ ...p, hour: +e.target.value }))}
                      className="w-full font-mono text-xs bg-pure-white border border-smoke rounded-sm px-2 py-1.5 text-ink focus:outline-none focus:border-ink">
                      {HOURS.map(h => <option key={h} value={h}>{h}:00</option>)}
                    </select>
                  </div>
                  <div className="flex-1">
                    <p className="font-mono text-2xs text-fog mb-1 tracking-widest uppercase">Duration</p>
                    <select value={newBlock.duration} onChange={e => setNewBlock(p => ({ ...p, duration: +e.target.value }))}
                      className="w-full font-mono text-xs bg-pure-white border border-smoke rounded-sm px-2 py-1.5 text-ink focus:outline-none focus:border-ink">
                      {[0.5,1,1.5,2,2.5,3,4].map(d => <option key={d} value={d}>{d}h</option>)}
                    </select>
                  </div>
                </div>
                <Button size="sm" onClick={addBlock}>Add Block</Button>
              </div>
            )}

            <div className="overflow-y-auto max-h-[460px]">
              {HOURS.map(hour => {
                const hourBlocks = (blocks[selectedDay] || []).filter(b => b.hour === hour)
                return (
                  <div key={hour} className="flex border-b border-paper-3 min-h-10">
                    <div className="w-12 flex-shrink-0 font-mono text-2xs text-fog px-2 pt-2.5 border-r border-paper-3">{String(hour).padStart(2,'0')}:00</div>
                    <div className="flex-1 p-1 flex flex-col gap-1">
                      {hourBlocks.map(block => (
                        <div key={block.id} className="bg-ink text-paper px-2.5 py-1.5 rounded-sm flex items-center justify-between">
                          <div>
                            <p className="font-sans text-sm">{block.label}</p>
                            <p className="font-mono text-2xs text-paper/50 mt-0.5">{block.duration}h</p>
                          </div>
                          <button onClick={() => deleteBlock(selectedDay, block.id)} className="text-paper/40 hover:text-paper transition-colors text-base font-mono ml-2">×</button>
                        </div>
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
          </Card>
        )}
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────
// GOALS
// ─────────────────────────────────────────────
type GoalTab = 'life' | 'yearly' | 'quarterly' | 'monthly' | 'weekly'
interface GoalItem { text: string; done: boolean; target?: number; current?: number; unit?: string }
interface GoalStore {
  life: { vision?: string; relationships?: string; financial?: string; health?: string; legacy?: string; items: GoalItem[] }
  yearly: { theme?: string; why?: string; top3: GoalItem[]; items: GoalItem[] }
  quarterly: Record<string, { theme?: string; items: GoalItem[] }>
  monthly: Record<string, { theme?: string; items: GoalItem[] }>
  weekly: Record<string, { theme?: string; items: GoalItem[]; win?: string }>
}

function defaultGoals(): GoalStore {
  return {
    life: { items: [] },
    yearly: { top3: [], items: [] },
    quarterly: { Q1:{items:[]}, Q2:{items:[]}, Q3:{items:[]}, Q4:{items:[]} },
    monthly: {},
    weekly: {},
  }
}

function GoalList({ items, path, label, onSave }: {
  items: GoalItem[]; path: string[]; label?: string
  onSave: (path: string[], idx: number | null, updates: Partial<GoalItem> | null, action: 'toggle' | 'delete' | 'add' | 'update', text?: string) => void
}) {
  const [newText, setNewText] = useState('')
  const [expandedIdx, setExpandedIdx] = useState<number | null>(null)

  return (
    <div>
      {label && <p className="font-mono text-2xs tracking-widest uppercase text-fog mb-4">{label}</p>}
      <div>
        {items.map((item, i) => {
          const hasProg = item.target != null && item.target > 0
          const pct = hasProg ? Math.min(100, Math.round(((item.current || 0) / item.target!) * 100)) : null
          const isExp = expandedIdx === i
          return (
            <div key={i} className="border-b border-paper-3 last:border-none">
              <div className="flex items-center gap-3 py-3">
                <Checkbox checked={item.done} onChange={() => onSave(path, i, null, 'toggle')} size="sm" />
                <span
                  onClick={() => setExpandedIdx(isExp ? null : i)}
                  className={cn('flex-1 font-sans text-sm cursor-pointer transition-all duration-200', item.done ? 'text-fog line-through' : 'text-ink')}
                >{item.text}</span>

                {hasProg && (
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <div className="w-20 h-1 bg-paper-3 rounded-full overflow-hidden">
                      <div className="h-full rounded-full transition-all duration-300" style={{ width:`${pct}%`, background: progressHex(pct!) }} />
                    </div>
                    <span className="font-mono text-2xs text-fog whitespace-nowrap">{item.current||0}/{item.target} {item.unit||''}</span>
                  </div>
                )}

                <button onClick={() => setExpandedIdx(isExp ? null : i)}
                  className="font-mono text-2xs text-fog hover:text-ink transition-colors px-1">{isExp ? '▲' : '▼'}</button>
                <button onClick={() => onSave(path, i, null, 'delete')}
                  className="font-mono text-sm text-smoke hover:text-red-500 transition-colors px-1">×</button>
              </div>

              {isExp && (
                <div className="px-4 py-4 mb-3 bg-paper border border-paper-3 rounded-sm animate-fade-in">
                  <p className="font-mono text-2xs tracking-widest uppercase text-fog mb-3">Track Progress</p>
                  <div className="grid grid-cols-3 gap-3">
                    {(['current','target','unit'] as const).map(field => (
                      <div key={field}>
                        <p className="font-mono text-2xs text-fog mb-1 uppercase tracking-widest">{field}</p>
                        <input
                          type={field === 'unit' ? 'text' : 'number'}
                          value={field === 'unit' ? (item.unit||'') : (item[field]||'')}
                          placeholder={field === 'unit' ? 'books, km...' : field === 'target' ? 'e.g. 52' : '0'}
                          onChange={e => onSave(path, i, { [field]: field === 'unit' ? e.target.value : +e.target.value }, 'update')}
                          className="w-full font-mono text-sm bg-pure-white border border-smoke rounded-sm px-2 py-1.5 text-ink focus:outline-none focus:border-ink"
                        />
                      </div>
                    ))}
                  </div>
                  {hasProg && (
                    <div className="mt-4">
                      <div className="flex justify-between mb-2">
                        <span className="font-mono text-2xs text-fog">{item.current||0} of {item.target} {item.unit}</span>
                        <span className={cn('font-mono text-2xs font-semibold', pct! >= 100 ? 'text-success' : 'text-ink')}>{pct}%</span>
                      </div>
                      <Progress value={pct!} color="dynamic" thickness="thick" />
                      {pct! >= 100 && <p className="font-mono text-2xs text-success mt-2 tracking-widest">✓ Goal achieved</p>}
                    </div>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>
      <div className="flex gap-3 mt-4">
        <Input value={newText} placeholder="Add a goal..." onChange={e => setNewText(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') { onSave(path, null, null, 'add', newText); setNewText('') } }} />
        <Button variant="ghost" size="sm" onClick={() => { onSave(path, null, null, 'add', newText); setNewText('') }}>Add</Button>
      </div>
    </div>
  )
}

export function GoalsPage() {
  const [tab, setTab] = useState<GoalTab>('yearly')
  const [goals, setGoals] = useState<GoalStore>(() => {
    try {
      const raw = localStorage.getItem('journal_state')
      const parsed = raw ? JSON.parse(raw) : {}
      return { ...defaultGoals(), ...(parsed.goals || {}) }
    } catch { return defaultGoals() }
  })

  const now = new Date()
  const monthKey = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}`
  const weekNum = Math.ceil((now.getDate() + new Date(now.getFullYear(), now.getMonth(), 1).getDay()) / 7)
  const weekKey = `${now.getFullYear()}-W${String(weekNum).padStart(2,'0')}`

  function save(updated: GoalStore) {
    setGoals(updated)
    const raw = localStorage.getItem('journal_state')
    const parsed = raw ? JSON.parse(raw) : {}
    parsed.goals = updated
    localStorage.setItem('journal_state', JSON.stringify(parsed))
  }

  function handleGoalSave(path: string[], idx: number | null, updates: Partial<GoalItem> | null, action: string, text?: string) {
    const updated = JSON.parse(JSON.stringify(goals)) as GoalStore
    let arr = updated as unknown as Record<string, unknown>
    path.forEach(p => { arr = arr[p] as Record<string, unknown> })
    const list = arr as unknown as GoalItem[]
    if (action === 'add' && text?.trim()) list.push({ text: text.trim(), done: false })
    else if (action === 'toggle' && idx != null) list[idx].done = !list[idx].done
    else if (action === 'delete' && idx != null) list.splice(idx, 1)
    else if (action === 'update' && idx != null && updates) list[idx] = { ...list[idx], ...updates }
    save(updated)
  }

  function setField(path: string[], value: string) {
    const updated = JSON.parse(JSON.stringify(goals)) as GoalStore
    let t = updated as unknown as Record<string, unknown>
    path.slice(0,-1).forEach(p => { t = t[p] as Record<string, unknown> })
    t[path[path.length-1]] = value
    save(updated)
  }

  const TABS: { id: GoalTab; label: string }[] = [
    { id:'life', label:'Life' }, { id:'yearly', label:'Yearly' },
    { id:'quarterly', label:'Quarterly' }, { id:'monthly', label:'Monthly' }, { id:'weekly', label:'Weekly' },
  ]

  return (
    <div className="animate-fade-up">
      {/* Header with tabs */}
      <div className="px-14 pt-11 pb-0 border-b border-paper-3 bg-paper">
        <h1 className="font-display font-bold text-4xl text-ink tracking-tight">Goals</h1>
        <p className="font-mono text-2xs tracking-widest uppercase text-fog mt-1.5 mb-5">Vision — Clarity — Execution</p>
        <div className="flex gap-0">
          {TABS.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={cn(
                'px-5 py-3 font-mono text-2xs tracking-widest uppercase cursor-pointer transition-all duration-150 border-b-2',
                tab === t.id ? 'text-ink border-ink' : 'text-fog border-transparent hover:text-ash hover:border-smoke'
              )}>
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div className="px-14 pt-9 pb-14">
        {tab === 'life' && (
          <div className="grid grid-cols-2 gap-6">
            {(['vision','financial','health','relationships','legacy'] as const).map(key => (
              <Card key={key}>
                <CardHeader><CardTitle>{key.charAt(0).toUpperCase()+key.slice(1)}</CardTitle></CardHeader>
                <CardContent>
                  <textarea rows={4} defaultValue={goals.life[key]||''} placeholder={`Your ${key}...`}
                    onBlur={e => setField(['life',key], e.target.value)}
                    className="w-full bg-transparent border-0 border-b border-smoke outline-none resize-none text-sm text-ink leading-[1.9] placeholder:text-fog focus:border-ink transition-colors" />
                </CardContent>
              </Card>
            ))}
            <Card className="col-span-2">
              <CardHeader><CardTitle>Life Goals</CardTitle></CardHeader>
              <CardContent>
                <GoalList items={goals.life.items} path={['life','items']} onSave={handleGoalSave} />
              </CardContent>
            </Card>
          </div>
        )}

        {tab === 'yearly' && (
          <div className="grid grid-cols-2 gap-6">
            <Card>
              <CardHeader><CardTitle>Year Theme</CardTitle></CardHeader>
              <CardContent className="flex flex-col gap-5">
                <Input defaultValue={goals.yearly.theme||''} placeholder="The year of..." onBlur={e => setField(['yearly','theme'], e.target.value)} />
                <div>
                  <p className="font-mono text-2xs tracking-widest uppercase text-fog mb-2">Why this year matters</p>
                  <textarea rows={3} defaultValue={goals.yearly.why||''} placeholder="This year I will..."
                    onBlur={e => setField(['yearly','why'], e.target.value)}
                    className="w-full bg-transparent border-0 border-b border-smoke outline-none resize-none text-sm text-ink leading-[1.9] placeholder:text-fog focus:border-ink transition-colors" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle>Top 3 Goals</CardTitle></CardHeader>
              <CardContent>
                <GoalList items={goals.yearly.top3} path={['yearly','top3']} onSave={handleGoalSave} />
              </CardContent>
            </Card>
            <Card className="col-span-2">
              <CardHeader><CardTitle>All Yearly Goals</CardTitle></CardHeader>
              <CardContent>
                <GoalList items={goals.yearly.items} path={['yearly','items']} onSave={handleGoalSave} />
              </CardContent>
            </Card>
          </div>
        )}

        {tab === 'quarterly' && (
          <div className="grid grid-cols-2 gap-6">
            {(['Q1','Q2','Q3','Q4'] as const).map(q => {
              const qData = goals.quarterly?.[q] || { items: [] }
              return (
                <Card key={q}>
                  <CardHeader className="flex flex-row items-center justify-between pb-0">
                    <span className="font-display font-bold text-xl text-ink">{q}</span>
                    <Input defaultValue={qData.theme||''} placeholder="Quarter theme..."
                      onBlur={e => setField(['quarterly',q,'theme'], e.target.value)} className="w-40" />
                  </CardHeader>
                  <CardContent className="pt-4">
                    <GoalList items={qData.items} path={['quarterly',q,'items']} onSave={handleGoalSave} />
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}

        {tab === 'monthly' && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-0">
              <span className="font-display font-bold text-xl text-ink">{MONTHS[now.getMonth()]} {now.getFullYear()}</span>
              <Input defaultValue={goals.monthly?.[monthKey]?.theme||''} placeholder="Month theme..."
                onBlur={e => setField(['monthly',monthKey,'theme'], e.target.value)} className="w-56" />
            </CardHeader>
            <CardContent className="pt-4">
              <GoalList items={goals.monthly?.[monthKey]?.items||[]} path={['monthly',monthKey,'items']} label="This Month's Goals" onSave={handleGoalSave} />
            </CardContent>
          </Card>
        )}

        {tab === 'weekly' && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-0">
              <span className="font-display font-bold text-xl text-ink">Week {weekNum}, {now.getFullYear()}</span>
              <Input defaultValue={goals.weekly?.[weekKey]?.theme||''} placeholder="Week theme..."
                onBlur={e => setField(['weekly',weekKey,'theme'], e.target.value)} className="w-56" />
            </CardHeader>
            <CardContent className="pt-4">
              <GoalList items={goals.weekly?.[weekKey]?.items||[]} path={['weekly',weekKey,'items']} label="This Week's Goals" onSave={handleGoalSave} />
              <Separator />
              <p className="font-mono text-2xs tracking-widest uppercase text-fog mb-3">Week's Big Win</p>
              <textarea rows={3} defaultValue={goals.weekly?.[weekKey]?.win||''} placeholder="This week's biggest win was..."
                onBlur={e => setField(['weekly',weekKey,'win'], e.target.value)}
                className="w-full bg-transparent border-0 border-b border-smoke outline-none resize-none text-sm text-ink leading-[1.9] placeholder:text-fog focus:border-ink transition-colors" />
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────
// AI COACH
// ─────────────────────────────────────────────
export function AICoachPage() {
  const [input, setInput] = useState('')
  const [messages, setMessages] = useState<{ role: 'user' | 'ai'; text: string }[]>([
    { role: 'ai', text: 'Welcome. I am your Stoic coach. Ask me anything about discipline, mindset, or your daily practice.' }
  ])
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages])

  async function sendMessage() {
    if (!input.trim() || loading) return
    const userMsg = input.trim()
    setInput('')
    setMessages(m => [...m, { role: 'user', text: userMsg }])
    setLoading(true)
    try {
      const res = await fetch('/api/ai-coach', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ message: userMsg }) })
      const data = await res.json()
      setMessages(m => [...m, { role: 'ai', text: data.reply || 'No response.' }])
    } catch {
      setMessages(m => [...m, { role: 'ai', text: 'Connection failed. Please try again.' }])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="animate-fade-up flex flex-col h-screen">
      <PageHeader title="AI Coach" subtitle="Your Personal Stoic Advisor" />

      <div className="flex-1 overflow-y-auto px-14 py-8 flex flex-col gap-6">
        {messages.map((msg, i) => (
          <div key={i} className={cn('flex', msg.role === 'user' ? 'justify-end' : 'justify-start')}>
            {msg.role === 'user' ? (
              <div className="max-w-[72%] bg-paper-2 border border-paper-3 rounded-sm px-4 py-3 font-sans text-sm text-ink leading-relaxed">
                {msg.text}
              </div>
            ) : (
              <div className="max-w-[82%] bg-pure-white border-l-[3px] border-ink px-5 py-4 font-display italic text-base text-ink leading-[1.75]">
                {msg.text}
              </div>
            )}
          </div>
        ))}
        {loading && (
          <div className="flex gap-1.5 items-center py-2">
            {[0,1,2].map(i => (
              <div key={i} className="w-1.5 h-1.5 rounded-full bg-fog animate-pulse" style={{ animationDelay: `${i*0.2}s` }} />
            ))}
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <div className="px-14 py-5 border-t border-paper-3 flex gap-3">
        <Input value={input} placeholder="Ask your Stoic coach..." onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && sendMessage()} className="flex-1" />
        <Button onClick={sendMessage} disabled={loading} loading={loading}>Send</Button>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────
// POMODORO
// ─────────────────────────────────────────────
export function PomodoroPage() {
  const [mode, setMode] = useState<'work' | 'break'>('work')
  const [workMins, setWorkMins] = useState(25)
  const [breakMins, setBreakMins] = useState(5)
  const [timeLeft, setTimeLeft] = useState(25 * 60)
  const [running, setRunning] = useState(false)
  const [sessions, setSessions] = useState(0)
  const [task, setTask] = useState('')
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  const totalSecs = mode === 'work' ? workMins * 60 : breakMins * 60
  const progress = ((totalSecs - timeLeft) / totalSecs) * 100
  const mins = String(Math.floor(timeLeft / 60)).padStart(2, '0')
  const secs = String(timeLeft % 60).padStart(2, '0')

  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => {
        setTimeLeft(t => {
          if (t <= 1) {
            clearInterval(intervalRef.current!)
            setRunning(false)
            if (mode === 'work') { setSessions(s => s + 1); setMode('break'); setTimeLeft(breakMins * 60) }
            else { setMode('work'); setTimeLeft(workMins * 60) }
            return 0
          }
          return t - 1
        })
      }, 1000)
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current) }
  }, [running, mode, workMins, breakMins])

  function reset() { setRunning(false); setTimeLeft(mode === 'work' ? workMins * 60 : breakMins * 60) }
  function switchMode(m: 'work' | 'break') { setRunning(false); setMode(m); setTimeLeft(m === 'work' ? workMins * 60 : breakMins * 60) }

  const circ = 2 * Math.PI * 80

  return (
    <div className="animate-fade-up">
      <PageHeader title="Focus" subtitle="Deep Work — One Block at a Time" />

      <div className="px-14 pt-9 pb-14 grid grid-cols-[1fr_280px] gap-10">
        {/* Timer */}
        <div className="flex flex-col items-center gap-8">
          {/* Mode toggle */}
          <div className="flex border border-smoke rounded-sm overflow-hidden">
            {(['work','break'] as const).map(m => (
              <button key={m} onClick={() => switchMode(m)}
                className={cn('px-6 py-2.5 font-mono text-2xs tracking-widest uppercase cursor-pointer transition-all duration-150',
                  mode === m ? 'bg-ink text-paper' : 'bg-transparent text-ash hover:bg-paper-3')}>
                {m === 'work' ? 'Focus' : 'Break'}
              </button>
            ))}
          </div>

          {/* SVG ring */}
          <div className="relative flex items-center justify-center">
            <svg width={200} height={200} viewBox="0 0 200 200" className="-rotate-90">
              <circle cx={100} cy={100} r={80} fill="none" stroke="#e8e5de" strokeWidth={4} />
              <circle cx={100} cy={100} r={80} fill="none" stroke="#0a0a0a" strokeWidth={4}
                strokeLinecap="round"
                strokeDasharray={circ}
                strokeDashoffset={circ - (progress/100)*circ}
                style={{ transition: running ? 'stroke-dashoffset 1s linear' : 'none' }}
              />
            </svg>
            <div className="absolute text-center">
              <div className="font-display font-bold text-5xl text-ink leading-none" style={{ letterSpacing: '-0.04em' }}>
                {mins}:{secs}
              </div>
              <div className="font-mono text-2xs tracking-widest uppercase text-fog mt-2">
                {mode === 'work' ? 'Focus' : 'Break'}
              </div>
            </div>
          </div>

          {/* Controls */}
          <div className="flex gap-3">
            <Button size="lg" className="w-32" onClick={() => setRunning(r => !r)}>
              {running ? 'Pause' : 'Start'}
            </Button>
            <Button variant="ghost" size="lg" onClick={reset}>Reset</Button>
          </div>

          {/* Task input */}
          <div className="w-full max-w-sm">
            <p className="font-mono text-2xs tracking-widest uppercase text-fog mb-2">Focusing on</p>
            <Input value={task} placeholder="What are you working on..." onChange={e => setTask(e.target.value)} />
          </div>
        </div>

        {/* Stats & settings */}
        <div className="flex flex-col gap-5">
          <Card>
            <CardHeader><CardTitle>Today</CardTitle></CardHeader>
            <CardContent>
              <div className="font-display font-bold text-5xl text-ink leading-none mb-1">{sessions}</div>
              <p className="font-mono text-2xs tracking-widest uppercase text-fog">Sessions completed</p>
              <Separator />
              <div className="font-display font-bold text-3xl text-ink leading-none mb-1">{sessions * workMins}</div>
              <p className="font-mono text-2xs tracking-widest uppercase text-fog">Minutes focused</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Timer Settings</CardTitle></CardHeader>
            <CardContent className="flex flex-col gap-5">
              <div>
                <p className="font-mono text-2xs text-fog mb-2">Focus: {workMins} min</p>
                <input type="range" min={5} max={60} step={5} value={workMins}
                  onChange={e => { setWorkMins(+e.target.value); if (!running && mode==='work') setTimeLeft(+e.target.value*60) }}
                  className="w-full accent-ink" />
              </div>
              <div>
                <p className="font-mono text-2xs text-fog mb-2">Break: {breakMins} min</p>
                <input type="range" min={1} max={30} step={1} value={breakMins}
                  onChange={e => { setBreakMins(+e.target.value); if (!running && mode==='break') setTimeLeft(+e.target.value*60) }}
                  className="w-full accent-ink" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

