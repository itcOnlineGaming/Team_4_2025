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
    .calendar-container {
        width: 100%;
        max-width: 1200px;
        margin: 0 auto;
        background: white;
        border-radius: 8px;
        box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
        overflow: hidden;
        font-family: 'Roboto', sans-serif;
    }
    
    .calendar-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 1rem 1.5rem;
        background: #f8f9fa;
        border-bottom: 1px solid #e0e0e0;
    }
    
    .navigation {
        display: flex;
        gap: 0.5rem;
        align-items: center;
    }
    
    .nav-button {
        background: none;
        border: 1px solid #dadce0;
        border-radius: 4px;
        padding: 0.5rem 0.75rem;
        cursor: pointer;
        font-size: 1.2rem;
        color: #3c4043;
        transition: background-color 0.2s;
    }
    
    .nav-button:hover {
        background-color: #f1f3f4;
    }
    
    .today-button {
        background: none;
        border: 1px solid #dadce0;
        border-radius: 4px;
        padding: 0.5rem 1rem;
        cursor: pointer;
        font-size: 0.875rem;
        color: #3c4043;
        transition: background-color 0.2s;
    }
    
    .today-button:hover {
        background-color: #f1f3f4;
    }
    
    .week-display {
        font-size: 1.375rem;
        font-weight: 400;
        color: #3c4043;
    }
    
    .calendar-grid {
        overflow-x: auto;
    }
    
    .grid-header {
        display: grid;
        grid-template-columns: 60px repeat(7, 1fr);
        border-bottom: 1px solid #e0e0e0;
        background: #f8f9fa;
    }
    
    .time-column-header {
        border-right: 1px solid #e0e0e0;
    }
    
    .day-header {
        padding: 1rem 0.5rem;
        text-align: center;
        border-right: 1px solid #e0e0e0;
        min-width: 120px;
    }
    
    .day-header:last-child {
        border-right: none;
    }
    
    .day-header.today {
        background-color: #e3f2fd;
    }
    
    .day-name {
        font-size: 0.75rem;
        font-weight: 500;
        color: #70757a;
        text-transform: uppercase;
        margin-bottom: 0.25rem;
    }
    
    .day-number {
        font-size: 1.625rem;
        font-weight: 400;
        color: #3c4043;
    }
    
    .day-number.today-number {
        background-color: #1976d2;
        color: white;
        border-radius: 50%;
        width: 2rem;
        height: 2rem;
        display: flex;
        align-items: center;
        justify-content: center;
        margin: 0 auto;
    }
    
    .grid-body {
        max-height: 600px;
        overflow-y: auto;
    }
    
    .time-row {
        display: grid;
        grid-template-columns: 60px repeat(7, 1fr);
        border-bottom: 1px solid #f0f0f0;
        min-height: 48px;
    }
    
    .time-slot {
        padding: 0.5rem;
        text-align: right;
        font-size: 0.75rem;
        color: #70757a;
        border-right: 1px solid #e0e0e0;
        display: flex;
        align-items: flex-start;
        justify-content: flex-end;
        padding-top: 0;
        margin-top: -6px;
    }
    
    .calendar-cell {
        border-right: 1px solid #f0f0f0;
        min-height: 48px;
        position: relative;
        cursor: pointer;
        transition: background-color 0.2s;
    }
    
    .calendar-cell:hover {
        background-color: #f8f9fa;
    }
    
    .calendar-cell:last-child {
        border-right: none;
    }
    
    .calendar-cell.current-hour {
        background-color: #fff3e0;
    }
    
    /* Responsive design */
    @media (max-width: 768px) {
        .calendar-container {
            margin: 0;
            border-radius: 0;
        }
        
        .day-header {
            min-width: 80px;
            padding: 0.5rem 0.25rem;
        }
        
        .day-name {
            font-size: 0.625rem;
        }
        
        .day-number {
            font-size: 1.25rem;
        }
        
        .week-display {
            font-size: 1rem;
        }
    }
</style>
