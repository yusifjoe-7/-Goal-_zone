
import { useState, useEffect, useRef } from "react";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
} from "@dnd-kit/core";
import type { DragEndEvent, DragStartEvent } from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useTaskStore } from "./zustan";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface Task {
  id: string;
  text: string;
  done: boolean;
  createdAt: number;
}

// ─── Local-storage helpers ────────────────────────────────────────────────────



function saveTasks(tasks: Task[]): void {
  localStorage.setItem("tasks", JSON.stringify(tasks));
}

// ─── Sortable task card ───────────────────────────────────────────────────────

function TaskCard({
  task,
  onToggle,
  onDelete,
  isDragging = false,
}: {
  task: Task;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  isDragging?: boolean;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging: isSortableDragging,
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isSortableDragging ? 0.35 : 1,
  };

  return (
    <li
      ref={setNodeRef}
      style={style}
      className={`group flex items-center gap-3 rounded-[var(--radius)] border px-4 py-3 
        bg-card text-card-foreground transition duration-200 border-border hover:shadow-md secFont
        ${isDragging ? "shadow-xl ring-2 ring-ring" : ""}
      `}
    >
      {/* drag handle */}
      <button
        {...listeners}
        {...attributes}
        aria-label="Drag to reorder"
        className="cursor-grab active:cursor-grabbing touch-none text-muted-foreground/40
          hover:text-muted-foreground transition-colors shrink-0 focus:outline-none"
      >
        <GripIcon />
      </button>

      {/* checkbox */}
      <button
        onClick={() => onToggle(task.id)}
        aria-label={task.done ? "Mark incomplete" : "Mark complete"}
        className="shrink-0 focus:outline-none cursor-pointer"
      >
        <span
          className={` flex h-5 w-5 items-center justify-center rounded-full border-2 transition-all duration-200
            ${task.done ? "border-primary bg-primary" : "border-border group-hover:border-primary"}`}
        >
          {task.done && (
            <svg
          
              viewBox="0 0 10 8"
              className="h-3 w-3 text-pf"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="1 4 4 7 9 1" />
            </svg>
          )}
        </span>
      </button>

      {/* text */}
      <span
        className={`flex-1 text-sm font-medium transition-all duration-200 leading-snug 
          ${task.done ? "line-through text-muted-foreground" : "text-foreground"}`}
      >
        {task.text}
      </span>

      {/* delete */}
      <button
        onClick={() => onDelete(task.id)}
        aria-label="Delete task"
        className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity 
          text-muted-foreground/40 hover:text-red-400 focus:outline-none cursor-pointer"
      >
        <TrashIcon />
      </button>
    </li>
  );
}

// ─── Overlay card (shown while dragging) ─────────────────────────────────────

function OverlayCard({ task }: { task: Task }) {
  return (
    <div
      className="flex items-center gap-3 rounded-[var(--radius)] border border-border px-4 py-3 
        bg-card shadow-2xl ring-2 ring-ring opacity-95"
    >
      <span className="text-muted-foreground/40">
        <GripIcon />
      </span>
      <span
        className={`flex h-5 w-5 items-center justify-center rounded-full border-2
          ${task.done ? "border-primary bg-primary" : "border-border"}`}
      >
        {task.done && (
          <svg
            viewBox="0 0 10 8"
            className="h-3 w-3 text-pf"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
          >
            <polyline points="1 4 4 7 9 1" />
          </svg>
        )}
      </span>
      <span
        className={`flex-1 text-sm font-medium ${task.done ? "line-through text-muted-foreground" : "text-foreground"}`}
      >
        {task.text}
      </span>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function TaskList() {
 const { tasks, setTasks } = useTaskStore()
  const [input, setInput] = useState("");
  const [activeId, setActiveId] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Load from localStorage on mount


  // Save whenever tasks change
  useEffect(() => {
   saveTasks(tasks)
  }, [tasks]);




  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } })
  );

  // ── CRUD ──────────────────────────────────────────────────────────────────



  function addTask() {
    
    const text = input.trim();
    if (!text) return;
    const newTask: Task = {
      id: crypto.randomUUID(),
      text,
      done: false,
      createdAt: Date.now(),
    };
    // Pending tasks on top, done tasks on bottom
    setTasks((prev) => {
      const pending = prev.filter((t) => !t.done);
      const done = prev.filter((t) => t.done);
      
      return [...pending, newTask, ...done];
      
    });
    setInput("");
    inputRef.current?.focus();
  }

  function toggleTask(id: string) {
    setTasks((prev) => {
      const updated = prev.map((t) =>
        t.id === id ? { ...t, done: !t.done } : t
      );
      // Move completed tasks to the bottom, keep order otherwise
      const pending = updated.filter((t) => !t.done);
      const done = updated.filter((t) => t.done);
      return [...pending, ...done];
    });
  }

  function deleteTask(id: string) {
    setTasks((prev) => prev.filter((t) => t.id !== id));
  }

  function clearDone() {
    setTasks((prev) => prev.filter((t) => !t.done));
  }

  // ── DnD ───────────────────────────────────────────────────────────────────

  function handleDragStart(event: DragStartEvent) {
    setActiveId(event.active.id as string);
  }

  function handleDragEnd(event: DragEndEvent) {
    setActiveId(null);
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setTasks((prev) => {
        const oldIndex = prev.findIndex((t) => t.id === active.id);
        const newIndex = prev.findIndex((t) => t.id === over.id);
        return arrayMove(prev, oldIndex, newIndex);
      });
    }
  }

  // ── Derived ────────────────────────────────────────────────────────────────

  const activeTask = tasks.find((t) => t.id === activeId) ?? null;
  const doneCount = tasks.filter((t) => t.done).length;
  const totalCount = tasks.length;

  return (
    <div className=" bg-background flex items-start justify-center my-1 py-6 sm:py-0 px-4 w-full order-2 md:order-1 sm:border-none border-t-2 border-border  ">
      <div className="w-full max-w-md space-y-6">

        {/* Header */}
        <div className="space-y-1">
          <h1 className="secFont text-3xl font-bold tracking-tight text-foreground">
          tasks
          </h1>
          <p className="text-sm text-muted-foreground">
            {totalCount === 0
              ?"add your tasks"
              : `done ${doneCount} from ${totalCount} `}
          </p>
        </div>

        {/* Progress bar */}
        {totalCount > 0 && (
          <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden" >
            <div
              className="h-full rounded-full bg-primary transition-all duration-500"
              style={{ width: `${(doneCount / totalCount) * 100}%` }}
            />
          </div>
        )}

        {/* Input */}
        <div className="flex gap-4 justify-center ">
          <input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addTask()}
            placeholder="add new task"
            dir="auto"
            className=" px-5 py-3 bg-card shadow-sm  sm:w-300 w-80 rounded-full active:ring-2 active:ring-ring
            [.dark_&]:border-2 border-border"
          />
          <button
            onClick={addTask}
            className=" bg-primary hover:scale-102
              text-pf px-5 py rounded-[2rem]  text-sm font-semibold shadow-md
              transition-all duration-200 cursor-pointer hover:shadow-2xl "
          >
            add
          </button>
        </div>

        {/* Task list */}
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <SortableContext items={tasks.map((t) => t.id)} strategy={verticalListSortingStrategy}>
            <ul className="space-y-2">
              {tasks.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onToggle={toggleTask}
                  onDelete={deleteTask}
                />
              ))}
            </ul>
          </SortableContext>

          <DragOverlay>
            {activeTask && <OverlayCard task={activeTask} />}
          </DragOverlay>
        </DndContext>

        {/* Empty state */}
        {tasks.length === 0 && (
          <div className="flex flex-col items-center gap-2 py-12 text-muted-foreground/30">
            <EmptyIcon />
            <p className="text-sm text-muted-foreground">there is no tasks</p>
          </div>
        )}

        {/* Clear done */}
        {doneCount > 0 && (
          <button
            onClick={clearDone}
            className="w-full rounded-[var(--radius)] border border-dashed border-border
              py-2.5 text-sm text-muted-foreground hover:bg-muted hover:text-foreground
              transition-all duration-200 focus:outline-none"
          >
           delet this task({doneCount})
          </button>
        )}
      </div>
    </div>
  );
}

// ─── Icons ────────────────────────────────────────────────────────────────────

function GripIcon() {
  return (
    <svg
      viewBox="0 0 16 16"
      className="h-4 w-4"
      fill="currentColor"
    >
      <circle cx="5" cy="4" r="1.2" />
      <circle cx="11" cy="4" r="1.2" />
      <circle cx="5" cy="8" r="1.2" />
      <circle cx="11" cy="8" r="1.2" />
      <circle cx="5" cy="12" r="1.2" />
      <circle cx="11" cy="12" r="1.2" />
    </svg>
  );
}


function TrashIcon() {
  return (
    <svg viewBox="0 0 16 16" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <polyline points="2 4 14 4" />
      <path d="M5 4V2h6v2" />
      <path d="M6 7v5M10 7v5" />
      <rect x="3" y="4" width="10" height="10" rx="1.5" />
    </svg>
  );
}

function EmptyIcon() {
  return (
    <svg viewBox="0 0 48 48" className="h-16 w-16" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
      <rect x="8" y="6" width="32" height="36" rx="4" />
      <line x1="16" y1="16" x2="32" y2="16" />
      <line x1="16" y1="22" x2="32" y2="22" />
      <line x1="16" y1="28" x2="24" y2="28" />
    </svg>
  );
}