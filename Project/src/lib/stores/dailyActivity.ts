import { writable } from 'svelte/store';

export interface DailyActivity {
    date: string; // ISO date string (YYYY-MM-DD)
    totalMinutes: number; // Total minutes worked that day
}

const DAILY_ACTIVITY_KEY = 'daily_activity';

function saveDailyActivity(activities: DailyActivity[]): void {
    if (typeof window === 'undefined') return;
    try {
        localStorage.setItem(DAILY_ACTIVITY_KEY, JSON.stringify(activities));
    } catch (error) {
        console.warn('Failed to save daily activity to localStorage:', error);
    }
}

function loadDailyActivity(): DailyActivity[] {
    if (typeof window === 'undefined') return [];
    try {
        const saved = localStorage.getItem(DAILY_ACTIVITY_KEY);
        return saved ? JSON.parse(saved) : [];
    } catch (error) {
        console.warn('Failed to load daily activity from localStorage:', error);
        return [];
    }
}

export const dailyActivity = writable<DailyActivity[]>(loadDailyActivity());

dailyActivity.subscribe(saveDailyActivity);

export function addTimeToDate(date: string, minutes: number): void {
    dailyActivity.update(activities => {
        const existing = activities.find(a => a.date === date);
        if (existing) {
            // Prevent negative time
            existing.totalMinutes = Math.max(0, existing.totalMinutes + minutes);

            // Remove entry if it reaches 0
            if (existing.totalMinutes === 0) {
                return activities.filter(a => a.date !== date);
            }
        } else if (minutes > 0) {
            // Only create new entry if adding positive time
            activities.push({ date, totalMinutes: minutes });
        }
        // If minutes is negative and no existing entry, ignore (prevent negative)
        return [...activities];
    });
}

export function getTotalMinutesForDate(date: string): number {
    let total = 0;
    const unsubscribe = dailyActivity.subscribe(activities => {
        const activity = activities.find(a => a.date === date);
        total = activity ? activity.totalMinutes : 0;
    });
    unsubscribe();
    return total;
}

export function repopulateFromCompletedTasks(completedTasks: Array<{ date: string; duration: number; completedOnDate?: string }>): void {
    dailyActivity.update(activities => {
        // Create a map of existing activities
        const activityMap = new Map(activities.map(a => [a.date, a.totalMinutes]));

        // Add up all completed task durations by their completedOnDate
        completedTasks.forEach(task => {
            const targetDate = task.completedOnDate || task.date;
            const current = activityMap.get(targetDate) || 0;
            activityMap.set(targetDate, current + task.duration);
        });

        // Convert map back to array, filtering out zero values
        return Array.from(activityMap.entries())
            .filter(([_, minutes]) => minutes > 0)
            .map(([date, totalMinutes]) => ({ date, totalMinutes }));
    });
}