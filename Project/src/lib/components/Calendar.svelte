<script lang="ts">
    export let selectedDate: Date = new Date();
    
    // Days of the week
    const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    
    // Generate time slots (24-hour format)
    const timeSlots: string[] = [];
    for (let hour = 0; hour < 24; hour++) {
        timeSlots.push(`${hour.toString().padStart(2, '0')}:00`);
    }
    
    // Get current week dates based on selectedDate
    function getCurrentWeekDates(date: Date): Date[] {
        const currentDate = new Date(date);
        const dayOfWeek = currentDate.getDay();
        const monday = new Date(currentDate);
        
        const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
        monday.setDate(currentDate.getDate() + diff);
        
        const weekDates: Date[] = [];
        for (let i = 0; i < 7; i++) {
            const date = new Date(monday);
            date.setDate(monday.getDate() + i);
            weekDates.push(date);
        }
        return weekDates;
    }
    
    $: weekDates = getCurrentWeekDates(selectedDate);
    
    function formatDate(date: Date): string {
        return date.getDate().toString();
    }
    
    function formatFullDate(date: Date): string {
        return date.toLocaleDateString('en-US', { 
            weekday: 'short', 
            month: 'short', 
            day: 'numeric' 
        });
    }
    
    function isToday(date: Date): boolean {
        const today = new Date();
        return date.toDateString() === today.toDateString();
    }
    
    // Navigation functions
    function goToPreviousWeek() {
        selectedDate = new Date(selectedDate.getTime() - 7 * 24 * 60 * 60 * 1000);
    }
    
    function goToNextWeek() {
        selectedDate = new Date(selectedDate.getTime() + 7 * 24 * 60 * 60 * 1000);
    }
    
    function goToToday() {
        selectedDate = new Date();
    }
</script>

<div class="calendar-container">
    <!-- Calendar Header -->
    <div class="calendar-header">
        <div class="navigation">
            <button class="nav-button" on:click={goToPreviousWeek}>
                ‹
            </button>
            <button class="today-button" on:click={goToToday}>
                Today
            </button>
            <button class="nav-button" on:click={goToNextWeek}>
                ›
            </button>
        </div>
        <div class="week-display">
            {formatFullDate(weekDates[0])} - {formatFullDate(weekDates[6])}
        </div>
    </div>
    
    <!-- Calendar Grid -->
    <div class="calendar-grid">
        <!-- Header row with time column and days -->
        <div class="grid-header">
            <div class="time-column-header"></div>
            {#each weekDates as date, index}
                <div class="day-header" class:today={isToday(date)}>
                    <div class="day-name">{daysOfWeek[index]}</div>
                    <div class="day-number" class:today-number={isToday(date)}>
                        {formatDate(date)}
                    </div>
                </div>
            {/each}
        </div>
        
        <!-- Time slots and grid -->
        <div class="grid-body">
            {#each timeSlots as timeSlot, timeIndex}
                <div class="time-row">
                    <div class="time-slot">
                        {timeSlot}
                    </div>
                    {#each weekDates as date, dayIndex}
                        <div class="calendar-cell" 
                             data-time={timeSlot} 
                             data-date={date.toISOString().split('T')[0]}
                             class:current-hour={isToday(date) && new Date().getHours() === timeIndex}>
                            <!-- This is where the tasks will go -->
                        </div>
                    {/each}
                </div>
            {/each}
        </div>
    </div>
</div>

<style>
    @import './style.css';
</style>


