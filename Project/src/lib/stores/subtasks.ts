import { writable } from 'svelte/store';

export interface Subtask {
    id: number;
    date: string;        // ISO date string (YYYY-MM-DD)
    startTime: string;   // Format: "HH:MM"
    endTime: string;     // Format: "HH:MM"
    title: string;
    description: string;
    status: 'pending' | 'completed' | 'cancelled';
    priority: 'high' | 'medium' | 'low';
    completedOnDate?: string; // Track which date it was completed on
    majorTaskId?: string; // Associated major task
    linkedSubtaskIds?: number[]; // Linked minor tasks
    // Recurrence fields
    isRecurring?: boolean;
    recurrencePattern?: 'daily' | 'weekly' | 'monthly';
    recurrenceEndDate?: string; // ISO date string (YYYY-MM-DD)
    recurrenceParentId?: number; // ID of the original recurring task
    isRecurrenceInstance?: boolean; // True if this is a generated instance
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
    linkedSubtaskIds?: number[],
    priority: 'high' | 'medium' | 'low' = 'medium',
    isRecurring?: boolean,
    recurrencePattern?: 'daily' | 'weekly' | 'monthly',
    recurrenceEndDate?: string
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
        priority,
        majorTaskId,
        linkedSubtaskIds,
        isRecurring,
        recurrencePattern,
        recurrenceEndDate
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

// Helper function to add days to a date
function addDays(dateStr: string, days: number): string {
    const date = new Date(dateStr);
    date.setDate(date.getDate() + days);
    return date.toISOString().split('T')[0];
}

// Helper function to add months to a date
function addMonths(dateStr: string, months: number): string {
    const date = new Date(dateStr);
    date.setMonth(date.getMonth() + months);
    return date.toISOString().split('T')[0];
}

// Generate recurring task instances
export function generateRecurringInstances(baseTask: Subtask): Subtask[] {
    if (!baseTask.isRecurring || !baseTask.recurrencePattern) {
        return [];
    }

    const instances: Subtask[] = [];
    let currentDate = baseTask.date;
    const endDate = baseTask.recurrenceEndDate || addMonths(baseTask.date, 12); // Default 1 year
    const maxInstances = 365; // Safety limit
    let count = 0;

    while (currentDate <= endDate && count < maxInstances) {
        // Skip the first instance (original task)
        if (currentDate !== baseTask.date) {
            const instance: Subtask = {
                ...baseTask,
                id: generateSubtaskId(),
                date: currentDate,
                status: 'pending',
                recurrenceParentId: baseTask.id,
                isRecurrenceInstance: true
            };
            instances.push(instance);
        }

        // Calculate next occurrence
        switch (baseTask.recurrencePattern) {
            case 'daily':
                currentDate = addDays(currentDate, 1);
                break;
            case 'weekly':
                currentDate = addDays(currentDate, 7);
                break;
            case 'monthly':
                currentDate = addMonths(currentDate, 1);
                break;
        }
        count++;
    }

    return instances;
}

// Helper function to create a recurring task and its instances
export function createRecurringTask(
    date: string,
    startTime: string,
    endTime: string,
    title: string,
    description: string,
    priority: 'high' | 'medium' | 'low',
    recurrencePattern: 'daily' | 'weekly' | 'monthly',
    recurrenceEndDate: string,
    majorTaskId?: string
): void {
    // Create the base recurring task
    const baseTask = createNewSubtask(
        date,
        startTime,
        endTime,
        title,
        description,
        'pending',
        majorTaskId,
        undefined,
        priority,
        true,
        recurrencePattern,
        recurrenceEndDate
    );

    // Generate all instances
    const instances = generateRecurringInstances(baseTask);

    // Add all tasks to the store
    subtasks.update(tasks => [...tasks, baseTask, ...instances]);
}

// Helper function to delete a recurring task and all its instances
export function deleteRecurringTask(taskId: number, deleteAllInstances: boolean = false): void {
    subtasks.update(tasks => {
        const task = tasks.find(t => t.id === taskId);
        if (!task) return tasks;

        // If deleting all instances, remove the parent and all children
        if (deleteAllInstances && task.isRecurring) {
            return tasks.filter(t => t.id !== taskId && t.recurrenceParentId !== taskId);
        }
        // If this is an instance, check if user wants to delete all
        else if (deleteAllInstances && task.isRecurrenceInstance && task.recurrenceParentId) {
            return tasks.filter(t => 
                t.id !== task.recurrenceParentId && 
                t.recurrenceParentId !== task.recurrenceParentId
            );
        }
        // Just delete this single task
        else {
            return tasks.filter(t => t.id !== taskId);
        }
    });
}

// Helper function to update a recurring task
export function updateRecurringTask(
    taskId: number, 
    updates: Partial<Omit<Subtask, 'id'>>,
    updateAllInstances: boolean = false
): void {
    subtasks.update(tasks => {
        const task = tasks.find(t => t.id === taskId);
        if (!task) return tasks;

        // Update all instances if requested
        if (updateAllInstances) {
            const parentId = task.isRecurring ? task.id : task.recurrenceParentId;
            return tasks.map(t => {
                if (t.id === parentId || t.recurrenceParentId === parentId) {
                    return { ...t, ...updates, date: t.date }; // Keep original dates
                }
                return t;
            });
        }
        // Just update this single task
        else {
            return tasks.map(t => t.id === taskId ? { ...t, ...updates } : t);
        }
    });
}
