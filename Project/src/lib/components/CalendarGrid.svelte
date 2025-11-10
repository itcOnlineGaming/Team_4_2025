<script lang="ts">
    import './style.css';
    export let weekDates: Date[];
    export let timeSlots: string[];
    export let daysOfWeek: string[];
    export let eventsIndex: Record<string, any>;
    export let handleCellClick: (date: string, time: string) => void;
    export let formatDate: (date: Date) => string;
    export let isToday: (date: Date) => boolean;

    // Helper for current hour
    let currentHour = new Date().getHours();
</script>

<div class="calendar-grid">
    <div class="grid-header">
        <div class="time-column-header"></div>
        {#each weekDates as date, index}
            <div class="day-header" class:today={isToday(date)}>
                <div class="day-name">{daysOfWeek[index].toUpperCase()}</div>
                <div class="day-number" class:today-number={isToday(date)}>
                    {formatDate(date)}
                </div>
            </div>
        {/each}
    </div>
    <div class="grid-body">
        {#each timeSlots as timeSlot, timeIndex}
            <div class="time-row">
                <div class="time-slot">{timeSlot}</div>
                {#each weekDates as date, dayIndex}
                    {@const dateStr = date.toISOString().split('T')[0]}
                    {@const key = `${dateStr}|${timeSlot}`}
                    <button
                        type="button"
                        class="calendar-cell"
                        class:current-hour={isToday(date) && currentHour === timeIndex}
                        class:has-event={!!eventsIndex[key]}
                        on:click={() => handleCellClick(dateStr, timeSlot)}
                    >
                        {#if eventsIndex[key]}
                            <div class="event-badge">{eventsIndex[key].title}</div>
                        {/if}
                    </button>
                {/each}
            </div>
        {/each}
    </div>
</div>
