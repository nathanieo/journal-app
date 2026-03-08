'use client'

import { useApp } from '../AppContext'
import Notebook from '../Notebook'
import { useState, useMemo, useRef, useEffect } from 'react'
import { MONTHS } from '@/types'
import { PageHeader } from '../ui/page-header'
import { Card, CardHeader, CardContent, CardTitle } from '../ui/card'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { cn } from '@/lib/utils'

type NotebookId = 'daily' | 'workout' | 'reading' | 'business' | 'gratitude'

interface NoteSection { id: string; title: string; content: string; updatedAt: string }
interface FreeNotebook { sections: NoteSection[] }

function loadFreeNotebook(id: string): FreeNotebook {
  try { return JSON.parse(localStorage.getItem(`notebook_${id}`) || '{"sections":[]}') }
  catch { return { sections: [] } }
}
function saveFreeNotebook(id: string, nb: FreeNotebook) {
  localStorage.setItem(`notebook_${id}`, JSON.stringify(nb))
}
function newSection(title = 'Untitled Page'): NoteSection {
  return { id: Date.now().toString(), title, content: '', updatedAt: new Date().toISOString() }
}

const FONTS = ['Times New Roman', 'Georgia', 'DM Sans', 'DM Mono', 'Arial', 'Courier New']
const FONT_SIZES = [10, 11, 12, 13, 14, 16, 18, 20, 24, 28, 32]

function FreeEditor({ notebookId, title }: { notebookId: string; title: string }) {
  const [nb, setNb] = useState<FreeNotebook>(() => {
    const loaded = loadFreeNotebook(notebookId)
    if (loaded.sections.length === 0) {
      const first = newSection('Page 1')
      const seeded = { sections: [first] }
      saveFreeNotebook(notebookId, seeded)
      return seeded
    }
    return loaded
  })
  const [activeId, setActiveId] = useState<string>(nb.sections[0]?.id || '')
  const [renamingId, setRenamingId] = useState<string | null>(null)
  const [font, setFont] = useState('Times New Roman')
  const [fontSize, setFontSize] = useState(14)
  const [bold, setBold] = useState(false)
  const [italic, setItalic] = useState(false)
  const [underline, setUnderline] = useState(false)
  const [align, setAlign] = useState<'left' | 'center' | 'right'>('left')
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const saveTimer = useRef<NodeJS.Timeout | null>(null)

  const activeSection = nb.sections.find(s => s.id === activeId)

  useEffect(() => { textareaRef.current?.focus() }, [activeId])

  function updateContent(val: string) {
    const updated = { sections: nb.sections.map(s => s.id === activeId ? { ...s, content: val, updatedAt: new Date().toISOString() } : s) }
    setNb(updated)
    if (saveTimer.current) clearTimeout(saveTimer.current)
    saveTimer.current = setTimeout(() => saveFreeNotebook(notebookId, updated), 600)
  }

  function addSection() {
    const s = newSection(`Page ${nb.sections.length + 1}`)
    const updated = { sections: [...nb.sections, s] }
    setNb(updated); saveFreeNotebook(notebookId, updated); setActiveId(s.id)
  }

  function deleteSection(id: string) {
    if (nb.sections.length <= 1) return
    const updated = { sections: nb.sections.filter(s => s.id !== id) }
    setNb(updated); saveFreeNotebook(notebookId, updated)
    if (activeId === id) setActiveId(updated.sections[0].id)
  }

  function renameSection(id: string, t: string) {
    const updated = { sections: nb.sections.map(s => s.id === id ? { ...s, title: t } : s) }
    setNb(updated); saveFreeNotebook(notebookId, updated); setRenamingId(null)
  }

  function insertText(prefix: string, suffix = '') {
    const ta = textareaRef.current
    if (!ta) return
    const start = ta.selectionStart; const end = ta.selectionEnd
    const selected = ta.value.slice(start, end)
    const newVal = ta.value.slice(0, start) + prefix + selected + suffix + ta.value.slice(end)
    updateContent(newVal)
    setTimeout(() => { ta.focus(); ta.setSelectionRange(start + prefix.length, end + prefix.length) }, 0)
  }

  function fmtDate(iso: string) {
    const d = new Date(iso)
    return `${MONTHS[d.getMonth()].slice(0,3)} ${d.getDate()}, ${d.getFullYear()}`
  }

  const ToolBtn = ({ label, active, onClick, title: ttl }: { label: string; active?: boolean; onClick: () => void; title?: string }) => (
    <button onClick={onClick} title={ttl}
      className={cn(
        'px-2 py-1 font-mono text-2xs rounded-sm border cursor-pointer transition-all duration-150 min-w-7',
        active ? 'bg-ink text-paper border-ink font-bold' : 'bg-transparent text-ash border-smoke hover:border-ink hover:text-ink'
      )}>
      {label}
    </button>
  )

  const ruledBg = `repeating-linear-gradient(to bottom, transparent, transparent ${fontSize * 2.4}px, rgba(0,0,0,0.05) ${fontSize * 2.4}px, rgba(0,0,0,0.05) ${fontSize * 2.4 + 1}px)`

  return (
    <div className="flex overflow-hidden" style={{ height: 'calc(100vh - 120px)' }}>
      {/* Sidebar */}
      <div className="w-52 border-r border-paper-3 bg-paper flex flex-col flex-shrink-0">
        <div className="px-4 py-4 border-b border-paper-3">
          <p className="font-display font-bold text-sm text-ink">{title}</p>
          <p className="font-mono text-2xs text-fog uppercase tracking-widest mt-0.5">{nb.sections.length} pages</p>
        </div>

        <div className="flex-1 overflow-y-auto py-2">
          {nb.sections.map(s => (
            <div key={s.id} onClick={() => setActiveId(s.id)}
              className={cn(
                'px-4 py-2.5 cursor-pointer transition-all duration-150 relative group border-l-[3px]',
                activeId === s.id ? 'bg-pure-white border-l-ink' : 'border-l-transparent hover:bg-black/[0.03]'
              )}>
              {renamingId === s.id ? (
                <input autoFocus defaultValue={s.title}
                  onBlur={e => renameSection(s.id, e.target.value || s.title)}
                  onKeyDown={e => { if (e.key === 'Enter') renameSection(s.id, e.currentTarget.value || s.title) }}
                  onClick={e => e.stopPropagation()}
                  className="w-full font-sans text-sm bg-transparent border-0 border-b border-ink outline-none py-0.5" />
              ) : (
                <>
                  <p onDoubleClick={e => { e.stopPropagation(); setRenamingId(s.id) }}
                    className={cn('font-sans text-sm truncate pr-5', activeId === s.id ? 'font-medium text-ink' : 'text-ash')}>
                    {s.title}
                  </p>
                  <p className="font-mono text-2xs text-smoke mt-0.5">{fmtDate(s.updatedAt)}</p>
                  {nb.sections.length > 1 && (
                    <button onClick={e => { e.stopPropagation(); deleteSection(s.id) }}
                      className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 text-smoke hover:text-red-500 transition-all text-base font-mono px-1">
                      ×
                    </button>
                  )}
                </>
              )}
            </div>
          ))}
        </div>

        <div className="px-4 py-3 border-t border-paper-3">
          <button onClick={addSection}
            className="w-full py-2 bg-transparent border border-dashed border-smoke rounded-sm font-mono text-2xs tracking-widest uppercase text-fog cursor-pointer transition-all duration-150 hover:border-ink hover:text-ink">
            + New Page
          </button>
        </div>
      </div>

      {/* Main editor area */}
      <div className="flex-1 flex flex-col overflow-hidden" style={{ background: '#faf9f5' }}>
        {/* Toolbar */}
        <div className="px-4 py-2 border-b border-paper-3 bg-pure-white flex items-center gap-2 flex-wrap flex-shrink-0">
          <select value={font} onChange={e => setFont(e.target.value)}
            className="font-mono text-2xs bg-transparent border border-smoke px-2 py-1 text-ink cursor-pointer rounded-sm max-w-[140px] focus:outline-none focus:border-ink">
            {FONTS.map(f => <option key={f} value={f}>{f}</option>)}
          </select>
          <select value={fontSize} onChange={e => setFontSize(+e.target.value)}
            className="font-mono text-2xs bg-transparent border border-smoke px-1.5 py-1 text-ink cursor-pointer rounded-sm w-14 focus:outline-none focus:border-ink">
            {FONT_SIZES.map(s => <option key={s} value={s}>{s}</option>)}
          </select>

          <div className="w-px h-5 bg-smoke" />
          <ToolBtn label="B" active={bold} onClick={() => setBold(!bold)} title="Bold" />
          <ToolBtn label="I" active={italic} onClick={() => setItalic(!italic)} title="Italic" />
          <ToolBtn label="U" active={underline} onClick={() => setUnderline(!underline)} title="Underline" />
          <div className="w-px h-5 bg-smoke" />
          <ToolBtn label="≡L" active={align === 'left'} onClick={() => setAlign('left')} />
          <ToolBtn label="≡C" active={align === 'center'} onClick={() => setAlign('center')} />
          <ToolBtn label="≡R" active={align === 'right'} onClick={() => setAlign('right')} />
          <div className="w-px h-5 bg-smoke" />
          <ToolBtn label="H1" active={false} onClick={() => insertText('\n# ')} />
          <ToolBtn label="H2" active={false} onClick={() => insertText('\n## ')} />
          <ToolBtn label="—" active={false} onClick={() => insertText('\n---\n')} />
          <ToolBtn label="•" active={false} onClick={() => insertText('\n• ')} />
          <ToolBtn label="1." active={false} onClick={() => insertText('\n1. ')} />
        </div>

        {activeSection && (
          <div className="relative flex-1 flex flex-col overflow-hidden">
            {/* Ruled lines */}
            <div className="absolute inset-0 pointer-events-none z-0"
              style={{ backgroundImage: ruledBg, backgroundPosition: `0 ${fontSize * 3.6 + 56}px` }} />
            <div className="absolute top-0 bottom-0 pointer-events-none z-0"
              style={{ left: 72, width: 1, background: 'rgba(180,60,60,0.15)' }} />

            {/* Page title */}
            <div className="relative z-10 px-10 pt-5 pb-3.5 border-b-2 border-ink flex-shrink-0" style={{ paddingLeft: 88 }}>
              <input type="text" defaultValue={activeSection.title} key={activeSection.id + '-title'}
                onBlur={e => renameSection(activeSection.id, e.target.value || activeSection.title)}
                onKeyDown={e => { if (e.key === 'Enter') e.currentTarget.blur() }}
                className="font-display font-bold text-2xl text-ink bg-transparent border-none outline-none w-full"
                style={{ fontFamily: `'${font}', serif` }} />
              <p className="font-mono text-2xs text-fog mt-1">
                Last edited {fmtDate(activeSection.updatedAt)} · {activeSection.content.length} chars
              </p>
            </div>

            {/* Writing area */}
            <textarea ref={textareaRef} key={activeSection.id + '-content'}
              defaultValue={activeSection.content}
              onChange={e => updateContent(e.target.value)}
              placeholder="Start writing..."
              className="relative z-10 flex-1 bg-transparent border-none outline-none resize-none w-full text-[#1e1e1e]"
              style={{
                padding: `20px 40px 40px 88px`,
                fontFamily: `'${font}', serif`,
                fontSize: `${fontSize}px`,
                lineHeight: 2.4,
                fontWeight: bold ? 700 : 400,
                fontStyle: italic ? 'italic' : 'normal',
                textDecoration: underline ? 'underline' : 'none',
                textAlign: align,
              }} />
          </div>
        )}
      </div>
    </div>
  )
}

// ── Notebook meta ──
interface NotebookMeta {
  id: NotebookId; title: string; subtitle: string; available: boolean
  freeEditor?: boolean; count?: number; icon: string; color: string
}

export default function EntriesPage() {
  const { allDays } = useApp()
  const [activeNotebook, setActiveNotebook] = useState<NotebookId | null>(null)
  const [search, setSearch] = useState('')
  const [monthFilter, setMonthFilter] = useState('')
  const [viewMode, setViewMode] = useState<'notebook' | 'list'>('notebook')

  const totalEntries = Object.keys(allDays).length
  const readingPages = loadFreeNotebook('reading').sections.filter(s => s.content).length
  const businessPages = loadFreeNotebook('business').sections.filter(s => s.content).length

  const notebooks: NotebookMeta[] = [
    { id: 'daily', title: 'Daily Journal', subtitle: 'Morning entries, reflections & disciplines', available: true, count: totalEntries, icon: '✦', color: '#0a0a0a' },
    { id: 'reading', title: 'Reading Notes', subtitle: 'Books, summaries & lessons', available: true, freeEditor: true, count: readingPages, icon: '◎', color: '#2a4a3a' },
    { id: 'business', title: 'Business Log', subtitle: 'Ideas, strategies & business thinking', available: true, freeEditor: true, count: businessPages, icon: '◈', color: '#3a2a4a' },
    { id: 'workout', title: 'Workout Log', subtitle: 'Strength training & progress tracking', available: false, icon: '▲', color: '#3a2a1a' },
    { id: 'gratitude', title: 'Gratitude', subtitle: 'Daily gratitude & wins', available: false, icon: '◇', color: '#1a2a3a' },
  ]

  const dailyEntries = useMemo(() => {
    let keys = Object.keys(allDays).sort((a, b) => b.localeCompare(a))
    if (monthFilter) keys = keys.filter(k => k.startsWith(monthFilter))
    if (search) {
      const q = search.toLowerCase()
      keys = keys.filter(k => {
        const d = allDays[k]
        return [d.journal_main, d.journal_intentions, d.ref_big_win, d.ref_went_well, d.ref_learned]
          .filter(Boolean).join(' ').toLowerCase().includes(q) || k.includes(q)
      })
    }
    return keys.map(k => allDays[k])
  }, [allDays, search, monthFilter])

  const active = notebooks.find(n => n.id === activeNotebook)

  // ── Shelf ──
  if (!activeNotebook) {
    return (
      <div className="animate-fade-up">
        <PageHeader title="Notebooks" subtitle="Your Personal Archive" />

        <div className="px-14 pt-9 pb-14">
          <p className="font-mono text-2xs tracking-widest uppercase text-fog mb-8 pb-3 border-b border-paper-3">
            Select a notebook
          </p>

          <div className="grid grid-cols-3 gap-5">
            {notebooks.map(nb => (
              <div key={nb.id}
                onClick={() => nb.available && setActiveNotebook(nb.id)}
                className={cn('transition-all duration-200', nb.available ? 'cursor-pointer hover:-translate-y-1 hover:shadow-2xl' : 'opacity-50')}
              >
                <div className="flex rounded-sm overflow-hidden shadow-card border border-black/[0.08]">
                  <div className="w-3.5 flex-shrink-0" style={{ background: nb.color }} />
                  <div className={cn('flex-1 p-8 min-h-[180px] flex flex-col justify-between', nb.available ? 'bg-pure-white' : 'bg-[#f4f2ee]')}>
                    <div>
                      <div className="text-2xl mb-3" style={{ color: nb.color }}>{nb.icon}</div>
                      <p className="font-display font-bold text-base text-ink leading-tight">{nb.title}</p>
                      <p className="font-sans text-sm text-fog mt-1.5 leading-relaxed">{nb.subtitle}</p>
                    </div>
                    <div className="flex items-end justify-between mt-5">
                      {nb.available ? (
                        <span className="font-mono text-2xs text-ash tracking-widest">
                          {nb.count} {nb.freeEditor ? 'pages' : nb.count === 1 ? 'entry' : 'entries'}
                        </span>
                      ) : (
                        <span className="font-mono text-2xs tracking-widest uppercase text-smoke border border-smoke px-2 py-0.5 rounded-sm">
                          Coming Soon
                        </span>
                      )}
                      {nb.available && <span className="font-mono text-2xs" style={{ color: nb.color }}>Open →</span>}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Shelf shadow */}
          <div className="mt-10 h-1.5 bg-gradient-to-b from-black/[0.07] to-transparent rounded" />
          <div className="h-0.5 bg-[#c8c5bc] rounded" />
        </div>
      </div>
    )
  }

  // ── Free editor ──
  if (active?.freeEditor) {
    return (
      <div className="animate-fade-up flex flex-col h-screen">
        <div className="px-14 pt-8 pb-5 border-b border-paper-3 bg-paper flex-shrink-0">
          <div className="flex items-center gap-3.5">
            <button onClick={() => setActiveNotebook(null)}
              className="font-mono text-2xs tracking-widest uppercase text-fog hover:text-ink transition-colors cursor-pointer bg-transparent border-none">
              ← Notebooks
            </button>
            <div className="w-px h-4 bg-smoke" />
            <div>
              <h1 className="font-display font-bold text-4xl text-ink tracking-tight">{active.title}</h1>
              <p className="font-mono text-2xs tracking-widest uppercase text-fog mt-1">{active.subtitle}</p>
            </div>
          </div>
        </div>
        <FreeEditor notebookId={activeNotebook} title={active.title} />
      </div>
    )
  }

  // ── Daily journal archive ──
  return (
    <div className="animate-fade-up">
      <div className="px-14 pt-8 pb-5 border-b border-paper-3 bg-paper">
        <div className="flex items-end justify-between">
          <div className="flex items-center gap-3.5">
            <button onClick={() => setActiveNotebook(null)}
              className="font-mono text-2xs tracking-widest uppercase text-fog hover:text-ink transition-colors cursor-pointer bg-transparent border-none">
              ← Notebooks
            </button>
            <div className="w-px h-4 bg-smoke" />
            <div>
              <h1 className="font-display font-bold text-4xl text-ink tracking-tight">{active?.title}</h1>
              <p className="font-mono text-2xs tracking-widest uppercase text-fog mt-1">{active?.subtitle}</p>
            </div>
          </div>

          <div className="flex gap-2.5 items-center">
            <div className="flex border border-smoke rounded-sm overflow-hidden">
              {(['notebook', 'list'] as const).map(mode => (
                <button key={mode} onClick={() => setViewMode(mode)}
                  className={cn('px-3.5 py-2 font-mono text-2xs tracking-widest uppercase cursor-pointer transition-all duration-150',
                    viewMode === mode ? 'bg-ink text-paper' : 'bg-transparent text-ash hover:bg-paper-3')}>
                  {mode}
                </button>
              ))}
            </div>
            <input type="text" value={search} placeholder="Search..." onChange={e => setSearch(e.target.value)}
              className="w-40 font-sans text-sm bg-transparent border-b border-smoke outline-none px-0 py-1 text-ink placeholder:text-fog focus:border-ink transition-colors" />
            <select value={monthFilter} onChange={e => setMonthFilter(e.target.value)}
              className="font-mono text-2xs bg-transparent border border-smoke px-2.5 py-1.5 text-ink cursor-pointer rounded-sm focus:outline-none focus:border-ink">
              <option value="">All months</option>
              {MONTHS.map((m, i) => <option key={m} value={`2026-${String(i+1).padStart(2,'0')}`}>{m} 2026</option>)}
            </select>
          </div>
        </div>
        <p className="font-mono text-2xs text-fog mt-2.5 tracking-widest">
          {dailyEntries.length} {dailyEntries.length === 1 ? 'entry' : 'entries'}
        </p>
      </div>

      {viewMode === 'notebook' ? (
        <Notebook entries={dailyEntries} />
      ) : (
        <div className="px-14 py-8">
          {dailyEntries.length === 0 ? (
            <p className="font-display italic text-base text-fog text-center py-16">No entries found.</p>
          ) : (
            <div className="flex flex-col divide-y divide-paper-3">
              {dailyEntries.map(entry => {
                const [year, month, day] = entry.date_key.split('-').map(Number)
                const d = new Date(year, month - 1, day)
                const dayName = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'][d.getDay()]
                const tasksDone = Object.values(entry.tasks || {}).filter(Boolean).length
                const pct = Math.round((tasksDone / 6) * 100)
                return (
                  <div key={entry.date_key} className="flex items-center gap-6 py-4 hover:bg-paper transition-colors">
                    <div className="w-20 flex-shrink-0">
                      <p className="font-display font-bold text-base text-ink">{dayName}</p>
                      <p className="font-mono text-2xs text-fog mt-0.5">{MONTHS[month-1].slice(0,3)} {day}</p>
                    </div>
                    <div className="flex-1 min-w-0">
                      {entry.journal_main ? (
                        <p className="font-sans text-sm text-ash italic truncate">{entry.journal_main.slice(0,120)}{entry.journal_main.length > 120 ? '...' : ''}</p>
                      ) : (
                        <p className="font-sans text-sm text-smoke">No journal entry</p>
                      )}
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className={cn('font-display font-bold text-base', pct >= 100 ? 'text-ink' : 'text-fog')}>{pct}%</p>
                      <p className="font-mono text-2xs text-fog">{tasksDone}/6</p>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
