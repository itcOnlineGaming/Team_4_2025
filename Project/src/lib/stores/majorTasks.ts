import { writable } from 'svelte/store';

export interface MajorTask {
  id: string;
  title: string;
  description: string;
  color: string;
  startDay: number; // 1-7 (Mon-Sun)
  endDay: number;   // 1-7 (Mon-Sun)
  weekStart: string; // ISO date string for Monday of the week
}

// LocalStorage keys
const MAJOR_TASKS_KEY = 'major_tasks';
const TASK_COUNTER_KEY = 'task_counter';

// LocalStorage helper functions
function saveMajorTasks(tasks: MajorTask[]): void {
  try {
    localStorage.setItem(MAJOR_TASKS_KEY, JSON.stringify(tasks));
  } catch (error) {
    console.warn('Failed to save major tasks to localStorage:', error);
  }
}

function loadMajorTasks(): MajorTask[] {
  try {
    const saved = localStorage.getItem(MAJOR_TASKS_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch (error) {
    console.warn('Failed to load major tasks from localStorage:', error);
    return [];
  }
}

function saveTaskCounter(counter: number): void {
  try {
    localStorage.setItem(TASK_COUNTER_KEY, counter.toString());
  } catch (error) {
    console.warn('Failed to save task counter to localStorage:', error);
  }
}

function loadTaskCounter(): number {
  try {
    const saved = localStorage.getItem(TASK_COUNTER_KEY);
    return saved ? parseInt(saved, 10) : 1;
  } catch (error) {
    console.warn('Failed to load task counter from localStorage:', error);
    return 1;
  }
}

// Initialize stores with data from localStorage
export const majorTasks = writable<MajorTask[]>(loadMajorTasks());

// Global task counter that persists across weeks
export const taskCounter = writable<number>(loadTaskCounter());

// Auto-save to localStorage when stores change
majorTasks.subscribe(saveMajorTasks);
taskCounter.subscribe(saveTaskCounter);

// Helper function to get Monday of current week
export function getWeekStart(date: Date = new Date()): string {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Adjust for Sunday
  d.setDate(diff);
  return d.toISOString().split('T')[0];
}

// Helper function to generate unique ID using global counter
export function generateTaskId(): string {
  let currentCounter = 1;
  taskCounter.update(count => {
    currentCounter = count;
    return count + 1;
  });
  return currentCounter.toString();
}

// Helper function to create a new task
export function createNewTask(weekStart: string): MajorTask {
  const id = generateTaskId();
  return {
    id,
    title: `Sample Task #${id}`,
    description: `Task description for Sample Task #${id}`,
    color: 'red',
    startDay: 1, // Monday
    endDay: 3,   // Wednesday
    weekStart
  };
}

// Helper function to delete a task
export function deleteTask(taskId: string): void {
  majorTasks.update(tasks => tasks.filter(task => task.id !== taskId));
}
