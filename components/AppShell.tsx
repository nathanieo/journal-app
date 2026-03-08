'use client'

import { AppProvider, useApp } from './AppContext'
import Sidebar from './Sidebar'
import TodayPage from './pages/TodayPage'
import JournalPage from './pages/JournalPage'
import ReflectionPage from './pages/ReflectionPage'
import TasksPage from './pages/TasksPage'
import DashboardPage from './pages/DashboardPage'
import EntriesPage from './pages/EntriesPage'
import OKRPage from './pages/OKRPage'
import WorkoutPage from './pages/WorkoutPage'
import { CalendarPage, GoalsPage, AICoachPage, PomodoroPage } from './pages/OtherPages'

function PageRouter() {
  const { page } = useApp()

  return (
    <main className="ml-[220px] flex-1 min-h-screen bg-paper animate-fade-up">
      {page === 'today'      && <TodayPage />}
      {page === 'tasks'      && <TasksPage />}
      {page === 'journal'    && <JournalPage />}
      {page === 'reflection' && <ReflectionPage />}
      {page === 'dashboard'  && <DashboardPage />}
      {page === 'calendar'   && <CalendarPage />}
      {page === 'entries'    && <EntriesPage />}
      {page === 'goals'      && <GoalsPage />}
      {page === 'okr'        && <OKRPage />}
      {page === 'ai'         && <AICoachPage />}
      {page === 'pomodoro'   && <PomodoroPage />}
      {page === 'workout'    && <WorkoutPage />}
    </main>
  )
}

export default function AppShell() {
  return (
    <AppProvider>
      <div className="flex min-h-screen">
        <Sidebar />
        <PageRouter />
      </div>
    </AppProvider>
  )
}
