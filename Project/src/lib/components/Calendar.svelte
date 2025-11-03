<script lang="ts">
    import { get } from "svelte/store";

    export let selectedDate: Date = new Date();
    export let selectedHour: number = 0;
    export let selectedDay: number = 0;

    // very simple event shape
    type CalendarEvent = {
        id: number;
        date: string;  // YYYY-MM-DD
        time: string;  // HH:00
        title: string;
    };
    export let events: CalendarEvent[] = [];
    
    // Days of the week
    const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    
    // Generate time slots (24-hour format)
    const timeSlots: string[] = [];
    for (let hour = 0; hour < 24; hour++) {
        timeSlots.push(`${hour.toString().padStart(2, '0')}:00`);
    }

    type timeCard = {
        title: string;
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

        let titles: string[][] = Array.from({ length: 24 }, () => Array(7).fill(''));

        function initializeTitles() 
        {
            titles = [];
            for (let i = 0; i < 24; i++) {
                titles[i] = [];
                for (let j = 0; j < 7; j++) {
                    titles[i][j] = '';
                }
            }
        }
        initializeTitles();

    function getIndexTitle(hour: number, day: number): string {
        return (titles[hour][day]) ? titles[hour][day] : 'NULL';
    }
    function setIndexTitle(hour: number, day: number, title: string) {
        titles[hour][day] = title;
        titles = titles.map(row => row.slice());
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

    // modal state (kept simple)
  let showModal = false;
  let targetDate = '';
  let targetTime = '';
  let titleInput = '';

  function handleCellClick(e: MouseEvent) {
    const el = e.currentTarget as HTMLElement;
    targetDate = el.dataset.date || '';
    targetTime = el.dataset.time || '';
    titleInput = '';
    showModal = true;
  }

  function closeModal() {
    showModal = false;
    titleInput = '';
  }

  function saveEvent() {
    const t = titleInput.trim();
    if (!t) { closeModal(); return; }
    const ev: CalendarEvent = {
      id: Date.now(), // simple id
      date: targetDate,
      time: targetTime,
      title: t
    };
    // reassign to trigger update
    events = [...events, ev];
    try { localStorage.setItem('calendar_events_v1', JSON.stringify(events)); } catch {}
    closeModal();
  }

  function eventsFor(d: string, t: string) {
    return events.filter(e => e.date === d && e.time === t);
  }

  function deleteEvent(id: number) {
    events = events.filter(e => e.id !== id);
    try { localStorage.setItem('calendar_events_v1', JSON.stringify(events)); } catch {}
  }

  // simple load
  if (!events.length) {
    try {
      const raw = localStorage.getItem('calendar_events_v1');
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) events = parsed;
      }
    } catch {}
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
                    <button
                        class="calendar-cell-button"
                        on:click={() => setIndexTitle(timeIndex, dayIndex, 'no meeting')}
                        data-time={timeSlot}
                        data-date={date.toISOString().split('T')[0]}
                    >
                        <p>{titles[timeIndex][dayIndex] || ''}</p>
                        <div
                        class="calendar-cell"
                        class:current-hour={isToday(date) && new Date().getHours() === timeIndex}
                        ></div>
                    </button>
                    {/each}
                </div>
            {/each}
        </div>
    </div>
</div>

<style>
    @import './style.css';
</style>


