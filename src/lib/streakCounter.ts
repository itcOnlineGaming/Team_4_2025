/**
 * Manages a daily streak counter using localStorage.
 * A streak increases when the user is active on consecutive days.
 */

const isBrowser = typeof window !== 'undefined';

export function incrementStreakCounter(): void {
    const currentStreak = getStreakCounter();
    localStorage.setItem('streakCounter', (currentStreak + 1).toString());
    localStorage.setItem('lastActiveDate', getCurrentDay());
    //if (!isBrowser) return;
//
    //if (checkFirstDay()) {
    //    // First time use - initialize streak and last active date
    //    localStorage.setItem('lastActiveDate', getCurrentDay());
    //    localStorage.setItem('streakCounter', '1');
    //    return;
    //}
//
    //if (checkActiveYesterday()) {
    //    // User was active yesterday - increment streak
    //    const currentStreak = getStreakCounter();
    //    localStorage.setItem('streakCounter', (currentStreak + 1).toString());
    //    localStorage.setItem('lastActiveDate', getCurrentDay());
    //} else {
    //    // User wasn't active yesterday - reset streak to 1
    //    localStorage.setItem('streakCounter', '1');
    //    localStorage.setItem('lastActiveDate', getCurrentDay());
    //}
}

/**
 * Gets the current streak count
 * @returns The current streak as a number, defaults to 0 if not set
 */
export function getStreakCounter(): number {
    if (!isBrowser) return 0;
    return parseInt(localStorage.getItem('streakCounter') || '0', 10);
}

/**
 * Resets the streak counter to 0
 */
export function resetStreakCounter(): void {
    if (!isBrowser) return;
    localStorage.setItem('streakCounter', '0');
}

/**
 * Gets the current day in YYYY-MM-DD format
 */
export function getCurrentDay(): string {
    return new Date().toISOString().split('T')[0];
}

/**
 * Checks if the user was active yesterday
 * @returns true if the last active date was yesterday
 */
export function checkActiveYesterday(): boolean {
    if (!isBrowser) return false;
    
    const lastActiveDate = localStorage.getItem('lastActiveDate');
    if (!lastActiveDate) return false;

    const yesterdayDate = new Date();
    yesterdayDate.setDate(yesterdayDate.getDate() - 1);
    const yesterday = yesterdayDate.toISOString().split('T')[0];

    return lastActiveDate === yesterday;
}

/**
 * Checks if this is the first time the streak is being tracked
 * @returns true if no lastActiveDate exists
 */
export function checkFirstDay(): boolean {
    if (!isBrowser) return true;
    return localStorage.getItem('lastActiveDate') === null;
}
