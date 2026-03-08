export interface DayData {
  id?: string
  user_id?: string
  date_key: string // YYYY-MM-DD
  tasks: Record<string, boolean>
  todos: Array<{ text: string; done: boolean }>
  focus1?: string
  focus2?: string
  focus3?: string
  improvement?: string
  journal_main?: string
  journal_intentions?: string
  journal_stoic?: string
  journal_business?: string
  journal_reading?: string
  ref_thought?: string
  ref_went_well?: string
  ref_big_win?: string
  ref_learned?: string
  ref_tomorrow?: string
  ref_gratitude?: string
  water?: number
  created_at?: string
  updated_at?: string
}

export interface Goal {
  text: string
  done: boolean
}

export interface GoalsData {
  life: {
    vision?: string
    relationships?: string
    financial?: string
    health?: string
    legacy?: string
    items: Goal[]
  }
  yearly: {
    theme?: string
    why?: string
    top3: Goal[]
    items: Goal[]
  }
}

export interface UserProfile {
  id: string
  email: string
  name?: string
  streak: number
  discipline_xp: number
  created_at: string
}

export type PageName =
  | 'today'
  | 'tasks'
  | 'journal'
  | 'reflection'
  | 'dashboard'
  | 'calendar'
  | 'entries'
  | 'goals'
  | 'okr'
  | 'ai'
  | 'pomodoro'
  | 'workout'

export const CORE_TASKS = [
  { id: 'workout', name: 'Workout' },
  { id: 'read', name: 'Read 30min' },
  { id: 'meditate', name: 'Meditate' },
  { id: 'journal', name: 'Journal' },
  { id: 'cold', name: 'Cold Shower' },
  { id: 'nophone', name: 'No Phone 1hr' },
] as const

export const QUOTES = [
  { text: 'You have power over your mind, not outside events. Realize this, and you will find strength.', author: 'Marcus Aurelius' },
  { text: 'The impediment to action advances action. What stands in the way becomes the way.', author: 'Marcus Aurelius' },
  { text: 'We suffer more in imagination than in reality.', author: 'Seneca' },
  { text: 'It is not that I am so smart, it is just that I stay with problems longer.', author: 'Albert Einstein' },
  { text: 'He who has a why to live can bear almost any how.', author: 'Friedrich Nietzsche' },
  { text: 'The cave you fear to enter holds the treasure you seek.', author: 'Joseph Campbell' },
  { text: 'Do not pray for an easy life. Pray for the strength to endure a difficult one.', author: 'Bruce Lee' },
  { text: 'If you are going through hell, keep going.', author: 'Winston Churchill' },
  { text: 'The first and greatest victory is to conquer yourself.', author: 'Plato' },
  { text: 'Waste no more time arguing about what a good man should be. Be one.', author: 'Marcus Aurelius' },
] as const

export const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'] as const
export const DAYS = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'] as const
