'use client'

import { useApp } from '../AppContext'
import { CORE_TASKS } from '@/types'
import { useState } from 'react'
import { PageHeader }  from '../ui/page-header'
import { Card, CardHeader, CardContent, CardTitle } from '../ui/card'
import { Progress, progressHex } from '../ui/progress'
import { Checkbox }    from '../ui/checkbox'
import { Button }      from '../ui/button'
import { Input }       from '../ui/input'
import { cn }          from '@/lib/utils'

export default function TasksPage() {
  const { today, saveDay } = useApp()
  const [newTodo, setNewTodo] = useState('')

  const tasksDone     = Object.values(today.tasks || {}).filter(Boolean).length
  const pct           = Math.round((tasksDone / CORE_TASKS.length) * 100)
  const allDone       = pct >= 100
  const completedTodos= (today.todos || []).filter(t => t.done).length
  const totalTodos    = (today.todos || []).length

  function addTodo() {
    const text = newTodo.trim()
    if (!text) return
    saveDay({ todos: [...(today.todos || []), { text, done: false }] })
    setNewTodo('')
  }

  function toggleTodo(i: number) {
    const todos = [...(today.todos || [])]
    todos[i] = { ...todos[i], done: !todos[i].done }
    saveDay({ todos })
  }

  function deleteTodo(i: number) {
    saveDay({ todos: (today.todos || []).filter((_, idx) => idx !== i) })
  }

  return (
    <div className="animate-fade-up">
      <PageHeader
        title="Disciplines"
        subtitle="Core habits + today's extra tasks"
        below={<Progress value={pct} color="dynamic" />}
      >
        <div className="text-right">
          <div className={cn(
            'font-display font-bold text-4xl leading-none transition-colors duration-300',
            allDone ? 'text-success' : 'text-ink'
          )}>
            {pct}%
          </div>
          <div className="font-mono text-2xs text-fog mt-0.5 tracking-widest">
            {tasksDone} of {CORE_TASKS.length} core
          </div>
        </div>
      </PageHeader>

      <div className="px-14 pt-9 pb-14 grid grid-cols-2 gap-7">

        {/* Core disciplines */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-0">
            <CardTitle>Core Disciplines</CardTitle>
            {allDone && <span className="font-mono text-2xs text-success tracking-widest">✓ All done</span>}
          </CardHeader>
          <CardContent className="pt-2">
            {CORE_TASKS.map(task => {
              const done = !!(today.tasks?.[task.id])
              return (
                <button
                  key={task.id}
                  onClick={() => saveDay({ tasks: { ...today.tasks, [task.id]: !done } })}
                  className={cn(
                    'w-full flex items-center gap-4 py-3.5 min-h-[52px]',
                    'border-b border-paper-3 last:border-none',
                    'transition-all duration-150 cursor-pointer select-none',
                    'hover:pl-1 focus-visible:outline-none focus-visible:pl-1',
                  )}
                >
                  <Checkbox checked={done} />
                  <span className={cn(
                    'flex-1 font-sans text-sm text-left transition-all duration-200',
                    done ? 'text-fog line-through' : 'text-ink font-medium'
                  )}>
                    {task.name}
                  </span>
                  {done && (
                    <span className="font-mono text-2xs text-fog tracking-widest">Done</span>
                  )}
                </button>
              )
            })}
          </CardContent>
        </Card>

        {/* Extra todos */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-0">
            <CardTitle>Extra To-Dos</CardTitle>
            {totalTodos > 0 && (
              <span className="font-mono text-2xs text-fog tracking-widest">
                {completedTodos}/{totalTodos}
              </span>
            )}
          </CardHeader>
          <CardContent className="pt-4">
            {/* Add new */}
            <div className="flex gap-3 items-end mb-6">
              <Input
                value={newTodo}
                placeholder="Add a task for today..."
                onChange={e => setNewTodo(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && addTodo()}
                className="flex-1"
              />
              <Button variant="primary" size="sm" onClick={addTodo}>
                Add
              </Button>
            </div>

            {/* List */}
            {(today.todos || []).length === 0 ? (
              <p className="font-sans text-sm text-fog italic py-3">No extra tasks today.</p>
            ) : (
              (today.todos || []).map((todo, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 py-3 border-b border-paper-3 last:border-none group"
                >
                  <Checkbox checked={todo.done} onChange={() => toggleTodo(i)} size="sm" />
                  <span
                    onClick={() => toggleTodo(i)}
                    className={cn(
                      'flex-1 font-sans text-sm cursor-pointer transition-all duration-200',
                      todo.done ? 'text-fog line-through' : 'text-ink'
                    )}
                  >
                    {todo.text}
                  </span>
                  <button
                    onClick={() => deleteTodo(i)}
                    className="text-smoke hover:text-red-500 transition-colors duration-150 font-mono text-base leading-none px-1 opacity-0 group-hover:opacity-100 focus-visible:opacity-100"
                  >
                    ×
                  </button>
                </div>
              ))
            )}
          </CardContent>
        </Card>

      </div>
    </div>
  )
}
