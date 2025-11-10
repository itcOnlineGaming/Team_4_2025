<script lang="ts">
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
    let draggedEvent: CalendarEvent | null = null;


    function drag(node: HTMLElement) {
        let isDragging = false;
        let offsetX = 0;
        let offsetY = 0;
        let originalPosition: { left: string; top: string; position: string; width: string } | null = null;
        let originalRect: DOMRect | null = null;

        const handleMousedown = (e: MouseEvent) => {
            // ✅ Only start dragging if this cell actually has an event
            if (!node.classList.contains('has-event')) return;

            isDragging = true;
            originalRect = node.getBoundingClientRect();
            node.style.zIndex = '1000';
            node.style.width = `${originalRect.width}px`; // lock width to cell width
            originalPosition = {
                left: node.style.left,
                top: node.style.top,
                position: node.style.position,
                width: node.style.width
            };
            offsetX = e.clientX - originalRect.left;
            offsetY = e.clientY - originalRect.top;
            node.style.cursor = 'grabbing';
            node.dispatchEvent(new CustomEvent('drag-started'));
        };

        const handleMousemove = (e: MouseEvent) => {
            if (!isDragging) return;
            node.style.position = 'absolute';
            node.style.pointerEvents = 'none';
            node.style.left = `${e.clientX - offsetX}px`;
            node.style.top = `${e.clientY - offsetY}px`;
        };

        const handleMouseup = () => {
            if (isDragging) {
                node.style.position = originalPosition?.position || '';
                node.style.left = originalPosition?.left || '';
                node.style.top = originalPosition?.top || '';
                node.style.pointerEvents = '';
                node.style.cursor = 'pointer';
                node.style.zIndex = '';
                node.style.width = originalPosition?.width || '';

                node.dispatchEvent(new CustomEvent('drag-ended'));
            }
            isDragging = false;
        };

        node.addEventListener('mousedown', handleMousedown);
        window.addEventListener('mousemove', handleMousemove);
        window.addEventListener('mouseup', handleMouseup);

        return {
            destroy() {
                node.removeEventListener('mousedown', handleMousedown);
                window.removeEventListener('mousemove', handleMousemove);
                window.removeEventListener('mouseup', handleMouseup);
            }
        };
    }



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

    function handleCellDragging(date: string, time: string) {
        const existingEvents = eventsFor(date, time);
        console.debug('handleCellDragging', { date, time, existingEventsLength: existingEvents.length, existingEvents });

        if (existingEvents.length > 0)
        {
            draggedEvent = existingEvents[0];
        }
    }

    function handleCellPlacement(date: string, time: string) {
        if (!draggedEvent) return;

        // Prevent placing in the same slot
        if (draggedEvent.date === date && draggedEvent.time === time) {
            draggedEvent = null;
            return;
        }

        // If target slot already has an event, skip
        const existingEvents = eventsFor(date, time);
        if (existingEvents.length > 0) {
            console.debug('Cell already occupied, skipping move');
            draggedEvent = null;
            return;
        }

        // Create an updated version of the event
        const updatedEvent = {
            ...draggedEvent,
            date,
            time
        };

        // Remove old event and add updated one
        events = events
            .filter(e => e.id !== draggedEvent!.id)
            .concat(updatedEvent);

        console.debug('Moved event', {
            id: draggedEvent.id,
            from: `${draggedEvent.date} ${draggedEvent.time}`,
            to: `${date} ${time}`
        });

        // Save to localStorage
        try {
            localStorage.setItem('calendar_events_v2', JSON.stringify(events));
        } catch (err) {
            console.error('Failed to save moved event:', err);
        }

        // Force UI refresh
        events = [...events];

        // Clear drag state
        draggedEvent = null;
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
                        {@const dateStr = date.toISOString().split('T')[0]}
                        {@const key = `${dateStr}|${timeSlot}`}
                        <button
                            type="button"
                            class="calendar-cell"
                            class:current-hour={isToday(date) && new Date().getHours() === timeIndex}
                            class:has-event={!!eventsIndex[key]}
                            on:click={() => handleCellClick(dateStr, timeSlot)}
                            on:mousedown={() => handleCellDragging(dateStr, timeSlot)}
                            on:mouseup={() => handleCellPlacement(dateStr, timeSlot)}
                            use:drag
                        >
                            {#if eventsIndex[key]}
                                <div class="event-badge">
                                    {eventsIndex[key].title}
                                </div>
                            {/if}
                        </button>
                    {/each}
                </div>
            {/each}
        </div>
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

<style>
    @import './style.css';
    .modal-content {
        font-family: Arial, Helvetica, sans-serif;
    }
</style>