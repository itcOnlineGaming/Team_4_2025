<script lang="ts">
    import CalendarGrid from './CalendarGrid.svelte';

    import MonthSidebar from './MonthSidebar.svelte';
    export let selectedDate: Date = new Date();

    // Event type with description
    type CalendarEvent = {
        id: number;
        date: string;  // YYYY-MM-DD
        time: string;  // HH:00
        title: string;
        description: string;
    };
    
    let events: CalendarEvent[] = [];
    // Reactive lookup map keyed by "YYYY-MM-DD|HH:MM" for fast template access and reliable reactivity
    let eventsIndex: Record<string, CalendarEvent | undefined> = {};

$: eventsIndex = events.reduce((acc: Record<string, CalendarEvent | undefined>, e) => {
    acc[`${e.date}|${e.time}`] = e;
    return acc;
}, {});
    
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

    // Modal state
    let showModal = false;
    let modalMode: 'create' | 'view' = 'create';
    let targetDate = '';
    let targetTime = '';
    let titleInput = '';
    let descriptionInput = '';
    let selectedEvent: CalendarEvent | null = null;

    function handleCellClick(date: string, time: string) {
        const existingEvents = eventsFor(date, time);
        console.debug('handleCellClick', { date, time, existingEventsLength: existingEvents.length, existingEvents });
        
        if (existingEvents.length > 0) {
            // View existing event
            selectedEvent = existingEvents[0];
            titleInput = selectedEvent.title;
            descriptionInput = selectedEvent.description;
            modalMode = 'view';
        } else {
            // Create new event
            selectedEvent = null;
            titleInput = '';
            descriptionInput = '';
            modalMode = 'create';
        }
        
        targetDate = date;
        targetTime = time;
        showModal = true;
    }

    function closeModal() {
        showModal = false;
        titleInput = '';
        descriptionInput = '';
        selectedEvent = null;
    }

    function saveEvent() {
        const t = titleInput.trim();
        console.debug('saveEvent called', { t, modalMode, selectedEvent, targetDate, targetTime, eventsBefore: events.length });
        if (!t) {
            console.debug('saveEvent aborted: empty title');
            closeModal();
            return;
        }
        
        if (modalMode === 'view' && selectedEvent) {
            // Update existing event
            events = events.map(e => 
                e.id === selectedEvent!.id 
                    ? { ...e, title: t, description: descriptionInput.trim() }
                    : e
            );
        } else {
            // Create new event
            const ev: CalendarEvent = {
                id: Date.now(),
                date: targetDate,
                time: targetTime,
                title: t,
                description: descriptionInput.trim()
            };
            console.debug('creating event', ev);
            events = [...events, ev];
        }
        
        try {
            localStorage.setItem('calendar_events_v2', JSON.stringify(events));
            console.debug('events saved to localStorage', { total: events.length, events });
            // Immediately re-read persisted events and apply them to ensure UI uses the persisted source of truth
            try {
                const rawAfterSave = localStorage.getItem('calendar_events_v2');
                if (rawAfterSave) {
                    const parsedAfterSave = JSON.parse(rawAfterSave);
                    if (Array.isArray(parsedAfterSave)) {
                        events = parsedAfterSave;
                        // force a shallow copy so Svelte's reactivity picks up the change
                        events = [...events];
                        console.debug('events reloaded from localStorage after save', events.length, events);
                    }
                }
            } catch (err2) {
                console.debug('failed to reload events after save', err2);
            }
        } catch (err) {
            console.debug('localStorage save failed', err);
        }
        
        closeModal();
    }

    function eventsFor(d: string, t: string) {
        return events.filter(e => e.date === d && e.time === t);
    }

$: console.debug('events changed', events.length);

    function deleteEvent() {
        if (selectedEvent) {
            events = events.filter(e => e.id !== selectedEvent!.id);
            try {
                localStorage.setItem('calendar_events_v2', JSON.stringify(events));
                // Read back persisted events to ensure UI consistency
                const rawAfterDelete = localStorage.getItem('calendar_events_v2');
                if (rawAfterDelete) {
                    const parsedAfterDelete = JSON.parse(rawAfterDelete);
                    if (Array.isArray(parsedAfterDelete)) {
                        events = parsedAfterDelete;
                        events = [...events];
                        console.debug('events reloaded from localStorage after delete', events.length, events);
                    }
                }
            } catch (err) {
                console.debug('localStorage save failed on delete', err);
            }
            closeModal();
        }
    }

    // Load events from localStorage
    if (!events.length) {
        try {
            const raw = localStorage.getItem('calendar_events_v2');
            if (raw) {
                const parsed = JSON.parse(raw);
                if (Array.isArray(parsed)) {
                    events = parsed;
                    events = [...events];
                    console.debug('loaded events from localStorage', events.length, events);
                }
            }
        } catch {}
    }
</script>


        <div class="calendar-shell">
    <MonthSidebar bind:selectedDate />
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
        <CalendarGrid
            {weekDates}
            {timeSlots}
            {daysOfWeek}
            {eventsIndex}
            {formatDate}
            {isToday}
            {handleCellClick}
        />
    </div>
</div>

<!-- Modal -->
{#if showModal}
    <div class="modal-overlay" on:click={closeModal} role="button" tabindex="0" on:keydown={(e) => (e.key === 'Enter' || e.key === ' ' || e.key === 'Escape') && closeModal()}>
        <div class="modal-content" on:click|stopPropagation role="dialog" aria-modal="true" tabindex="-1" on:keydown|stopPropagation={(e) => e.key === 'Escape' && closeModal()}>
                <div class="modal-header">
                <h2>{modalMode === 'create' ? 'Create Event' : 'Event Details'}</h2>
                <button type="button" class="close-button" on:click={closeModal}>×</button>
            </div>
            
            <div class="modal-body">
                <div class="modal-info">
                    <strong>Date:</strong> {targetDate} at {targetTime}
                </div>
                
                <div class="form-group">
                    <label for="title">Title</label>
                    <input
                        id="title"
                        type="text"
                        bind:value={titleInput}
                        placeholder="Enter event title"
                        class="modal-input"
                    />
                </div>
                
                <div class="form-group">
                    <label for="description">Description</label>
                    <textarea
                        id="description"
                        bind:value={descriptionInput}
                        placeholder="Enter event description (optional)"
                        class="modal-textarea"
                        rows="4"
                    ></textarea>
                </div>
            </div>
            
            <div class="modal-footer">
                {#if modalMode === 'view'}
                    <button type="button" class="delete-button" on:click={deleteEvent}>
                        Delete
                    </button>
                {/if}
                <button type="button" class="cancel-button" on:click={closeModal}>
                    Cancel
                </button>
                <button type="button" class="save-button" on:click={saveEvent}>
                    {modalMode === 'create' ? 'Create' : 'Update'}
                </button>
            </div>
        </div>
    </div>
{/if}

