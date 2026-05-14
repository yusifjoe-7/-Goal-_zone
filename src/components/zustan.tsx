// store.ts
import { create } from 'zustand'
import type { Task } from './Tasks'
interface TaskStore {
  tasks: Task[]
  setTasks: (tasks: Task[] | ((prev: Task[]) => Task[])) => void
  clearTasks: () => void
}

export const useTaskStore = create<TaskStore>((set, get) => ({
  tasks: (() => {
    if (typeof window === "undefined") return []
    const raw = localStorage.getItem("tasks")
    try { return raw ? JSON.parse(raw) : [] }
    catch { return [] }
  })(),
  setTasks: (tasks) =>
    set({ tasks: typeof tasks === "function" ? tasks(get().tasks) : tasks }),
  clearTasks: () => set({ tasks: [] }),
}))