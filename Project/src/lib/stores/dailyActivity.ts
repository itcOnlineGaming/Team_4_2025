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
            existing.totalMinutes += minutes;
        } else {
            activities.push({ date, totalMinutes: minutes });
        }
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