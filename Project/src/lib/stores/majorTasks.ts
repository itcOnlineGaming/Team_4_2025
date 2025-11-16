import { writable } from 'svelte/store';

export interface MajorTask {
  id: string;
  title: string;
  color: string;
  startDay: number; // 1-7 (Mon-Sun)
  endDay: number;   // 1-7 (Mon-Sun)
  weekStart: string; // ISO date string for Monday of the week
}

export const majorTasks = writable<MajorTask[]>([]);

// Global task counter that persists across weeks
export const taskCounter = writable<number>(1);

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
    color: 'red',
    startDay: 1, // Monday
    endDay: 3,   // Wednesday
    weekStart
  };
}
