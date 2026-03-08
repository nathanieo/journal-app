'use client'

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from 'react'
import { createClient } from '@/lib/supabase'
import { DayData, GoalsData, PageName, CORE_TASKS } from '@/types'

// Day resets at 5:00 AM — before 5am still counts as "yesterday"
function getToday(): string {
  const now = new Date()
  if (now.getHours() < 5) {
    now.setDate(now.getDate() - 1)
  }
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
}
const TODAY = getToday()

function defaultDay(): DayData {
  return {
    date_key: TODAY,
    tasks: {},
    todos: [],
    water: 0,
  }
}

interface AppState {
  page: PageName
  setPage: (p: PageName) => void
  today: DayData
  setToday: (d: DayData) => void
  allDays: Record<string, DayData>
  goals: GoalsData
  streak: number
  disciplineXp: number
  saving: boolean
  userId: string | null
  saveDay: (data: Partial<DayData>) => Promise<void>
  loadEntries: () => Promise<void>
}

const AppContext = createContext<AppState | null>(null)

export function AppProvider({ children }: { children: ReactNode }) {
  const [page, setPage] = useState<PageName>('today')
  const [today, setTodayState] = useState<DayData>(defaultDay())
  const [allDays, setAllDays] = useState<Record<string, DayData>>({})
  const [goals, setGoals] = useState<GoalsData>({ life: { items: [] }, yearly: { top3: [], items: [] } })
  const [streak, setStreak] = useState(0)
  const [disciplineXp, setDisciplineXp] = useState(0)

  function calcStreak(days: Record<string, DayData>): number {
    let count = 0
    const now = new Date()
    if (now.getHours() < 5) now.setDate(now.getDate() - 1)
    for (let i = 0; i <= 365; i++) {
      const d = new Date(now)
      d.setDate(d.getDate() - i)
      const key = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`
      const entry = days[key]
      if (!entry) break
      const done = Object.values(entry.tasks || {}).filter(Boolean).length
      if (done === 0) break
      count++
    }
    return count
  }
  const [saving, setSaving] = useState(false)
  const [userId, setUserId] = useState<string | null>(null)

  const supabase = createClient()

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUserId(data.user?.id ?? null)
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      setUserId(session?.user?.id ?? null)
    })
    return () => subscription.unsubscribe()
  }, [])

  // Load today's data from Supabase or localStorage fallback
  useEffect(() => {
    if (userId) {
      loadFromSupabase()
    } else {
      loadFromLocal()
    }
  }, [userId])

  function loadFromLocal() {
    try {
      const raw = localStorage.getItem('journal_state')
      if (raw) {
        const parsed = JSON.parse(raw)
        setAllDays(parsed.days || {})
        const td = parsed.days?.[TODAY] || defaultDay()
        setTodayState({ ...defaultDay(), ...td, date_key: TODAY })
        setStreak(calcStreak(parsed.days || {}))
        setDisciplineXp(parsed.xp || 0)
        setGoals(parsed.goals || goals)
      }
    } catch (e) {
      console.error('Failed to load local state', e)
    }
  }

  async function loadFromSupabase() {
    if (!userId) return
    const { data } = await supabase
      .from('day_entries')
      .select('*')
      .eq('user_id', userId)
      .order('date_key', { ascending: false })
      .limit(365)

    if (data) {
      const days: Record<string, DayData> = {}
      data.forEach((row) => {
        days[row.date_key] = {
          date_key: row.date_key,
          tasks: row.tasks || {},
          todos: row.todos || [],
          focus1: row.focus1,
          focus2: row.focus2,
          focus3: row.focus3,
          improvement: row.improvement,
          journal_main: row.journal_main,
          journal_intentions: row.journal_intentions,
          journal_stoic: row.journal_stoic,
          journal_business: row.journal_business,
          journal_reading: row.journal_reading,
          ref_thought: row.ref_thought,
          ref_went_well: row.ref_went_well,
          ref_big_win: row.ref_big_win,
          ref_learned: row.ref_learned,
          ref_tomorrow: row.ref_tomorrow,
          ref_gratitude: row.ref_gratitude,
          water: row.water || 0,
        }
      })
      setAllDays(days)
      setTodayState({ ...defaultDay(), ...(days[TODAY] || {}), date_key: TODAY })
    }

    // Load profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('streak, discipline_xp')
      .eq('id', userId)
      .single()
    if (profile) {
      setStreak(profile.streak || 0)
      setDisciplineXp(profile.discipline_xp || 0)
    }

    // Load goals
    const { data: goalsData } = await supabase
      .from('goals')
      .select('data')
      .eq('user_id', userId)
      .single()
    if (goalsData?.data) setGoals(goalsData.data)
  }

  const saveDay = useCallback(async (updates: Partial<DayData>) => {
    const newData = { ...today, ...updates, date_key: TODAY }
    setTodayState(newData)
    setAllDays(prev => {
      const updated = { ...prev, [TODAY]: newData }
      setStreak(calcStreak(updated))
      return updated
    })
    setSaving(true)

    try {
      if (userId) {
        await supabase.from('day_entries').upsert({
          user_id: userId,
          date_key: TODAY,
          tasks: newData.tasks,
          todos: newData.todos,
          focus1: newData.focus1,
          focus2: newData.focus2,
          focus3: newData.focus3,
          improvement: newData.improvement,
          journal_main: newData.journal_main,
          journal_intentions: newData.journal_intentions,
          journal_stoic: newData.journal_stoic,
          journal_business: newData.journal_business,
          journal_reading: newData.journal_reading,
          ref_thought: newData.ref_thought,
          ref_went_well: newData.ref_went_well,
          ref_big_win: newData.ref_big_win,
          ref_learned: newData.ref_learned,
          ref_tomorrow: newData.ref_tomorrow,
          ref_gratitude: newData.ref_gratitude,
          water: newData.water,
        }, { onConflict: 'user_id,date_key' })
      } else {
        // LocalStorage fallback
        const prev = JSON.parse(localStorage.getItem('journal_state') || '{}')
        prev.days = { ...(prev.days || {}), [TODAY]: newData }
        localStorage.setItem('journal_state', JSON.stringify(prev))
      }
    } finally {
      setTimeout(() => setSaving(false), 1200)
    }
  }, [today, userId])

  const loadEntries = useCallback(async () => {
    if (userId) await loadFromSupabase()
  }, [userId])

  return (
    <AppContext.Provider value={{
      page, setPage,
      today, setToday: setTodayState,
      allDays, goals, streak, disciplineXp,
      saving, userId, saveDay, loadEntries,
    }}>
      {children}
    </AppContext.Provider>
  )
}

export function useApp() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be inside AppProvider')
  return ctx
}
