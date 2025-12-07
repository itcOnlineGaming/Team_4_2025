<script lang="ts">
    import type { Writable } from 'svelte/store';
    import type { DailyActivity } from '$lib/stores/dailyActivity';

    // User must provide a store with this interface
    /*export interface DailyActivity {
        date: string; // date string (YYYY-MM-DD)
        totalMinutes: number; // Total minutes worked that day
    } */

    export let activityStore: Writable<DailyActivity[]>;

    interface DayCell {
        date: Date;
        dateString: string;
        minutes: number;
        intensity: number; // 0-4 scale for color intensity
        beforeFirstActivity?: boolean; // Mark cells before any activity started
    }

    let activities: DailyActivity[] = [];
    let grid: DayCell[][] = [];
    let months: Array<{ name: string; column: number }> = [];
    let maxMinutes = 0;

    // Statistics
    let dailyAverage = 0;
    let daysActivePercent = 0;
    let longestStreak = 0;
    let currentStreak = 0;

    $: activities = $activityStore;
    $: if (activities) {
        generateGrid();
        calculateStats();
    }

    function calculateStats() {
        if (!activities || activities.length === 0) {
            dailyAverage = 0;
            daysActivePercent = 0;
            longestStreak = 0;
            currentStreak = 0;
            return;
        }

        // Daily Average (in hours)
        const totalMinutes = activities.reduce((sum, a) => sum + a.totalMinutes, 0);
        dailyAverage = totalMinutes / 60 / activities.length;

        // Days Active Percent (from first activity to today)
        const dates = activities.map(a => new Date(a.date)).sort((a, b) => a.getTime() - b.getTime());
        const firstDate = dates[0];
        const today = new Date();
        const daysSinceFirst = Math.floor((today.getTime() - firstDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
        daysActivePercent = (activities.length / daysSinceFirst) * 100;

        // Calculate streaks
        const activityDates = new Set(activities.map(a => a.date));

        // Longest streak
        let maxStreak = 0;
        let tempStreak = 0;
        const checkDate = new Date(firstDate);

        while (checkDate <= today) {
            const dateStr = checkDate.toISOString().split('T')[0];
            if (activityDates.has(dateStr)) {
                tempStreak++;
                maxStreak = Math.max(maxStreak, tempStreak);
            } else {
                tempStreak = 0;
            }
            checkDate.setDate(checkDate.getDate() + 1);
        }
        longestStreak = maxStreak;

        // Current streak (counting backwards from today)
        let currentStreakCount = 0;
        const todayCheck = new Date();

        while (true) {
            const dateStr = todayCheck.toISOString().split('T')[0];
            if (activityDates.has(dateStr)) {
                currentStreakCount++;
                todayCheck.setDate(todayCheck.getDate() - 1);
            } else {
                break;
            }
        }
        currentStreak = currentStreakCount;
    }

    function generateGrid() {
        if (!activities || activities.length === 0) {
            grid = Array.from({ length: 7 }, () => []);
            months = [];
            maxMinutes = 0;
            // Still generate empty grid for structure
        }

        const today = new Date();
        const endDate = new Date(today);

        // Go back ~52 weeks to show a full year
        const startDate = new Date(today);
        startDate.setDate(startDate.getDate() - 364);

        // Adjust to start on Sunday
        const dayOfWeek = startDate.getDay();
        startDate.setDate(startDate.getDate() - dayOfWeek);

        // Create activity map for quick lookup
        const activityMap = new Map<string, number>();
        if (activities) {
            activities.forEach(a => {
                activityMap.set(a.date, a.totalMinutes);
            });
        }

        // Find the first activity date
        let firstActivityDate: Date | null = null;
        if (activities && activities.length > 0) {
            const dates = activities.map(a => new Date(a.date)).sort((a, b) => a.getTime() - b.getTime());
            firstActivityDate = dates[0];
        }

        // Calculate max minutes for scaling
        maxMinutes = activities && activities.length > 0 ? Math.max(...activities.map(a => a.totalMinutes), 1) : 1;

        // Generate grid (7 rows for days of week, columns for weeks)
        const tempGrid: DayCell[][] = Array.from({ length: 7 }, () => []);
        const monthsTemp: Array<{ name: string; column: number }> = [];
        let currentMonth = -1;

        const currentDate = new Date(startDate);
        let weekIndex = 0;

        while (currentDate <= today) {
            const dateString = currentDate.toISOString().split('T')[0];
            const minutes = activityMap.get(dateString) || 0;
            const intensity = minutes > 0 ? Math.min(4, Math.ceil((minutes / maxMinutes) * 4)) : 0;

            // Check if this date is before the first activity
            const isBeforeFirstActivity = firstActivityDate && currentDate < firstActivityDate;

            const dayOfWeek = currentDate.getDay();

            tempGrid[dayOfWeek].push({
                date: new Date(currentDate),
                dateString,
                minutes,
                intensity,
                beforeFirstActivity: isBeforeFirstActivity
            });

            // Track month changes for labels
            if (currentDate.getMonth() !== currentMonth && dayOfWeek === 0) {
                currentMonth = currentDate.getMonth();
                monthsTemp.push({
                    name: currentDate.toLocaleDateString('en-US', { month: 'short' }),
                    column: weekIndex
                });
            }

            // Move to next day
            currentDate.setDate(currentDate.getDate() + 1);
            if (currentDate.getDay() === 0 && currentDate <= today) {
                weekIndex++;
            }
        }

        grid = tempGrid;
        months = monthsTemp;
    }

    function getColor(intensity: number): string {
        const colors = [
            '#ebedf0', // 0 - no activity (grey)
            '#9be9a8', // 1 - low
            '#40c463', // 2 - medium-low
            '#30a14e', // 3 - medium-high
            '#216e39'  // 4 - high
        ];
        return colors[intensity] || colors[0];
    }

    function formatTooltip(cell: DayCell): string {
        const dateStr = cell.date.toLocaleDateString('en-US', {
            weekday: 'short',
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });

        if (cell.minutes === 0) {
            return `${dateStr}: No activity`;
        }

        const hours = Math.floor(cell.minutes / 60);
        const mins = cell.minutes % 60;

        if (hours > 0) {
            return `${dateStr}: ${hours}h ${mins}m`;
        } else {
            return `${dateStr}: ${mins}m`;
        }
    }

    const dayLabels = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
</script>

<div class="heatmap-container">
    <div class="heatmap">
        <!-- Day labels -->
        <div class="day-labels">
            {#each dayLabels as label, i}
                {#if i % 2 === 1}
                    <div class="day-label">{label}</div>
                {:else}
                    <div class="day-label-spacer"></div>
                {/if}
            {/each}
        </div>

        <div class="grid-wrapper">
            <!-- Month labels -->
            <div class="month-labels">
                {#each months as month}
                    <div class="month-label" style="left: {month.column * 13}px">
                        {month.name}
                    </div>
                {/each}
            </div>

            <!-- Grid -->
            <div class="grid">
                {#each Array(7) as _, dayIndex}
                    <div class="grid-row">
                        {#each grid[dayIndex] || [] as cell}
                            <div
                                    class="cell"
                                    class:empty={cell.minutes === 0}
                                    class:before-activity={cell.beforeFirstActivity}
                                    style="background-color: {getColor(cell.intensity)}"
                                    title={formatTooltip(cell)}
                            ></div>
                        {/each}
                    </div>
                {/each}
            </div>
        </div>
    </div>

    <!-- Statistics -->
    <div class="stats">
        <div class="stat-item">
            <span class="stat-label">Daily Average:</span>
            <span class="stat-value">{dailyAverage.toFixed(1)}h</span>
        </div>
        <div class="stat-item">
            <span class="stat-label">Days Active:</span>
            <span class="stat-value">{daysActivePercent.toFixed(0)}%</span>
        </div>
        <div class="stat-item">
            <span class="stat-label">Longest Streak:</span>
            <span class="stat-value">{longestStreak} days</span>
        </div>
        <div class="stat-item">
            <span class="stat-label">Current Streak:</span>
            <span class="stat-value">{currentStreak} days</span>
        </div>
    </div>

    <!-- Legend -->
    <div class="legend">
        <span class="legend-label">Less</span>
        {#each [0, 1, 2, 3, 4] as intensity}
            <div
                    class="legend-cell"
                    style="background-color: {getColor(intensity)}"
            ></div>
        {/each}
        <span class="legend-label">More</span>
    </div>
</div>

<style>
    .heatmap-container {
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', sans-serif;
        padding: 20px;
        max-width: 100%;
    }

    .heatmap {
        display: flex;
        gap: 4px;
    }

    .day-labels {
        display: flex;
        flex-direction: column;
        gap: 3px;
        padding-top: 24px;
        margin-right: 8px;
    }

    .day-label {
        font-size: 10px;
        color: #666;
        height: 10px;
        line-height: 10px;
        text-align: right;
    }

    .day-label-spacer {
        height: 10px;
    }

    .grid-wrapper {
        position: relative;
        flex: 1;
    }

    .month-labels {
        position: absolute;
        top: 0;
        left: 0;
        height: 20px;
        width: 100%;
    }

    .month-label {
        position: absolute;
        font-size: 10px;
        color: #666;
    }

    .grid {
        display: flex;
        flex-direction: column;
        gap: 3px;
        padding-top: 24px;
    }

    .grid-row {
        display: flex;
        flex-direction: row;
        gap: 3px;
    }

    .cell {
        width: 10px;
        height: 10px;
        border-radius: 2px;
        cursor: pointer;
        transition: all 0.1s ease;
    }

    .cell:hover {
        outline: 2px solid rgba(0, 0, 0, 0.3);
        outline-offset: 1px;
        transform: scale(1.1);
    }

    .cell.empty {
        opacity: 0.8;
    }

    .cell.before-activity {
        background-color: #1a1a1a !important;
        opacity: 0.15;
        cursor: default;
    }

    .cell.before-activity:hover {
        outline: none;
        transform: none;
    }

    .legend {
        display: flex;
        align-items: center;
        gap: 4px;
        margin-top: 16px;
        margin-left: 42px;
        font-size: 11px;
        color: #666;
    }

    .legend-label {
        margin: 0 4px;
    }

    .legend-cell {
        width: 10px;
        height: 10px;
        border-radius: 2px;
    }

    .stats {
        display: flex;
        gap: 24px;
        margin-top: 20px;
        margin-left: 42px;
        font-size: 12px;
    }

    .stat-item {
        display: flex;
        flex-direction: column;
        gap: 4px;
    }

    .stat-label {
        color: #666;
        font-size: 11px;
    }

    .stat-value {
        color: #333;
        font-weight: 600;
        font-size: 14px;
    }
</style>