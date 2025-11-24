import { writable } from 'svelte/store';

export interface Subtask {
    id: number;
    date: string;        // ISO date string (YYYY-MM-DD)
    startTime: string;   // Format: "HH:MM"
    endTime: string;     // Format: "HH:MM"
    title: string;
    description: string;
    status: 'pending' | 'completed' | 'cancelled';
    completedOnDate?: string; // Track which date it was completed on
    majorTaskId?: string; // Associated major task
    linkedSubtaskIds?: number[]; // Linked minor tasks
}

// LocalStorage keys
const SUBTASKS_KEY = 'calendar_subtasks';
const SUBTASK_COUNTER_KEY = 'subtask_counter';

// LocalStorage helper functions
function saveSubtasks(tasks: Subtask[]): void {
    if (typeof window === 'undefined') return;
    try {
        localStorage.setItem(SUBTASKS_KEY, JSON.stringify(tasks));
    } catch (error) {
        console.warn('Failed to save subtasks to localStorage:', error);
    }
}

function loadSubtasks(): Subtask[] {
    if (typeof window === 'undefined') return [];
    try {
        const saved = localStorage.getItem(SUBTASKS_KEY);
        return saved ? JSON.parse(saved) : [];
    } catch (error) {
        console.warn('Failed to load subtasks from localStorage:', error);
        return [];
    }
}

function saveSubtaskCounter(counter: number): void {
    if (typeof window === 'undefined') return;
    try {
        localStorage.setItem(SUBTASK_COUNTER_KEY, counter.toString());
    } catch (error) {
        console.warn('Failed to save subtask counter to localStorage:', error);
    }
}

function loadSubtaskCounter(): number {
    if (typeof window === 'undefined') return 1;
    try {
        const saved = localStorage.getItem(SUBTASK_COUNTER_KEY);
        return saved ? parseInt(saved, 10) : 1;
    } catch (error) {
        console.warn('Failed to load subtask counter from localStorage:', error);
        return 1;
    }
}

// Initialize stores with data from localStorage
export const subtasks = writable<Subtask[]>(loadSubtasks());

// Global subtask counter
export const subtaskCounter = writable<number>(loadSubtaskCounter());

// Auto-save to localStorage when stores change
subtasks.subscribe(saveSubtasks);
subtaskCounter.subscribe(saveSubtaskCounter);

// Helper function to generate unique ID using global counter
export function generateSubtaskId(): number {
    let currentCounter = 1;
    subtaskCounter.update(count => {
        currentCounter = count;
        return count + 1;
    });
    return currentCounter;
}

// Helper function to create a new subtask
export function createNewSubtask(
    date: string,
    startTime: string,
    endTime: string,
    title?: string,
    description?: string,
    status: 'pending' | 'completed' | 'cancelled' = 'pending',
    majorTaskId?: string,
    linkedSubtaskIds?: number[]
): Subtask {
    const id = generateSubtaskId();

    return {
        id,
        date,
        startTime,
        endTime,
        title: title || `Subtask #${id}`,
        description: description || '',
        status,
        majorTaskId,
        linkedSubtaskIds: linkedSubtaskIds || []
    };
}

// Helper function to delete a subtask
export function deleteSubtask(taskId: number): void {
    subtasks.update(tasks => tasks.filter(task => task.id !== taskId));
}

// Helper function to update a subtask
export function updateSubtask(taskId: number, updates: Partial<Omit<Subtask, 'id'>>): void {
    subtasks.update(tasks =>
        tasks.map(task =>
            task.id === taskId ? { ...task, ...updates } : task
        )
    );
}

// Helper function to get subtasks for a specific date
export function getSubtasksByDate(date: string): Subtask[] {
    let tasksForDate: Subtask[] = [];
    const unsubscribe = subtasks.subscribe(tasks => {
        tasksForDate = tasks.filter(task => task.date === date);
    });
    unsubscribe();
    return tasksForDate;
}

// Helper function to get subtasks for a date range
export function getSubtasksInRange(startDate: string, endDate: string): Subtask[] {
    let tasksInRange: Subtask[] = [];
    const unsubscribe = subtasks.subscribe(tasks => {
        tasksInRange = tasks.filter(task =>
            task.date >= startDate && task.date <= endDate
        );
    });
    unsubscribe();
    return tasksInRange;
}

// Helper function to convert time string to minutes
export function timeToMinutes(timeStr: string): number {
    const [hours, minutes] = timeStr.split(':').map(Number);
    return hours * 60 + minutes;
}

// Helper function to convert minutes to time string
export function minutesToTime(minutes: number): string {
    const hours = Math.floor(minutes / 60) % 24;
    const mins = minutes % 60;
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
}

// Helper function to get subtask duration in minutes
export function getSubtaskDuration(subtask: Subtask): number {
    const startMinutes = timeToMinutes(subtask.startTime);
    const endMinutes = timeToMinutes(subtask.endTime);
    return endMinutes - startMinutes;
}
