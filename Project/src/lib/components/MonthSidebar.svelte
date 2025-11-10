<script lang="ts">
    import { onMount } from 'svelte';
    export let selectedDate: Date = new Date();

    // Sidebar internal state
    let expanded = false;
    let viewDate = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1);

    // Keep view in sync when the selected date changes from parent
    $: if (selectedDate && (selectedDate.getFullYear() !== viewDate.getFullYear() || selectedDate.getMonth() !== viewDate.getMonth())) {
        viewDate = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1);
    }

    function toggleSidebar() {
        expanded = !expanded;
    }

    function prevMonth() {
        viewDate = new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1);
    }

    function nextMonth() {
        viewDate = new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1);
    }

    function selectDay(day: number | null) {
        if (day === null) return;
        selectedDate = new Date(viewDate.getFullYear(), viewDate.getMonth(), day);
    }

    function monthMatrix(date: Date) {
        // Returns an array of weeks, each week is an array of numbers or null for empty cells
        const year = date.getFullYear();
        const month = date.getMonth();
        const first = new Date(year, month, 1);
        const last = new Date(year, month + 1, 0);
        const numDays = last.getDate();
        const startDay = (first.getDay() + 6) % 7; // convert so Monday=0 .. Sunday=6

        const weeks: (number | null)[][] = [];
        let week: (number | null)[] = Array(7).fill(null);
        let dayCounter = 1;

        // Fill first week
        for (let i = startDay; i < 7; i++) {
            week[i] = dayCounter++;
        }
        weeks.push(week.slice());

        while (dayCounter <= numDays) {
            week = Array(7).fill(null);
            for (let i = 0; i < 7 && dayCounter <= numDays; i++) {
                week[i] = dayCounter++;
            }
            weeks.push(week.slice());
        }

        return weeks;
    }

    const weekdayShort = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

    // Small helper
    function isSameDay(a: Date, b: Date) {
        return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
    }
</script>

<aside class="month-sidebar" class:collapsed={!expanded}>
    <div class="sidebar-header">
        <button class="toggle-button" on:click={toggleSidebar} aria-label="Toggle sidebar">
            {#if expanded}◀︎{:else}▶︎{/if}
        </button>
        {#if expanded}
            <div class="month-controls">
                <button class="nav" on:click={prevMonth} aria-label="Previous month">‹</button>
                <div class="month-label">{viewDate.toLocaleString(undefined, { month: 'long', year: 'numeric' })}</div>
                <button class="nav" on:click={nextMonth} aria-label="Next month">›</button>
            </div>
        {/if}
    </div>

    {#if expanded}
        <div class="month-grid">
            <div class="weekdays">
                {#each weekdayShort as wd}
                    <div class="weekday">{wd}</div>
                {/each}
            </div>

            {#each monthMatrix(viewDate) as week}
                <div class="week-row">
                    {#each week as day}
                        <button
                            class="day-cell"
                            class:selected={day !== null && isSameDay(new Date(viewDate.getFullYear(), viewDate.getMonth(), day), selectedDate)}
                            on:click={() => selectDay(day)}
                            disabled={day === null}
                            aria-pressed={day !== null && isSameDay(new Date(viewDate.getFullYear(), viewDate.getMonth(), day), selectedDate)}
                        >
                            {#if day !== null}{day}{/if}
                        </button>
                    {/each}
                </div>
            {/each}
        </div>
    {/if}
</aside>

<style>
    .month-sidebar {
        width: 260px;
        transition: width 200ms ease, opacity 200ms ease;
        background: #fafafa;
        border-radius: 8px;
        padding: 0.5rem;
        box-shadow: 0 2px 8px rgba(0,0,0,0.06);
        box-sizing: border-box;
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
    }

    .month-sidebar.collapsed {
        width: 48px;
        overflow: hidden;
    }

    .sidebar-header {
        display: flex;
        align-items: center;
        gap: 0.5rem;
    }

    .toggle-button {
        width: 32px;
        height: 32px;
        border-radius: 6px;
        border: 1px solid #ddd;
        background: white;
        cursor: pointer;
    }

    .month-controls {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        flex: 1;
        justify-content: center;
    }

    .month-label {
        font-weight: 600;
    }

    .nav {
        padding: 4px 8px;
        border-radius: 6px;
        border: 1px solid #e0e0e0;
        background: white;
        cursor: pointer;
    }

    .month-grid {
        display: flex;
        flex-direction: column;
        gap: 0.25rem;
    }

    .weekdays {
        display: grid;
        grid-template-columns: repeat(7, 1fr);
        gap: 4px;
        font-size: 0.8rem;
        color: #666;
        text-align: center;
    }

    .week-row {
        display: grid;
        grid-template-columns: repeat(7, 1fr);
        gap: 4px;
    }

    .day-cell {
        height: 36px;
        border-radius: 6px;
        border: none;
        background: transparent;
        cursor: pointer;
    }

    .day-cell:hover {
        background: rgba(25,118,210,0.06);
    }

    .day-cell.selected {
        background: #1976d2;
        color: white;
    }

    @media (max-width: 900px) {
        .month-sidebar { display: none; }
    }
</style>
