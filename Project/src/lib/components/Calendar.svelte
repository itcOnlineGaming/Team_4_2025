<script lang="ts">
    import CalendarGrid from './CalendarGrid.svelte';
    import EventModal from './EventModal.svelte';
    import MajorItemModal from './TIMELINE/MajorItemModal.svelte';
    import MonthSidebar from './MonthSidebar.svelte';
    import {
        subtasks,
        createNewSubtask,
        deleteSubtask,
        updateSubtask,
        timeToMinutes,
        minutesToTime,
        type Subtask,
        getSubtaskDuration
    } from '../stores/subtasks';
    import { majorTasks, createNewTask, getWeekStart } from '../stores/majorTasks';
    import { addTimeToDate, repopulateFromCompletedTasks, dailyActivity } from '../stores/dailyActivity';
    import { onMount } from 'svelte';

    let eventsIndex: Record<string, Subtask> = {};
    let showModal = false;
    let showMajorTaskModal = false;
    let modalMode: 'create' | 'view' = 'create';
    let selectedEvent: Subtask | null = null;
    let targetDate = '';
    let targetStartTime = '';
    let startTimeInput = '';
    let endTimeInput = '';
    let titleInput = '';
    let descriptionInput = '';
    let showAddOptions = false;
    let currentWeekStart = '';
    let majorTaskIdInput = '';

    // Zoom state: pixels per hour (default 60px = 1 hour)
    let pixelsPerHour = 60;
    const MIN_ZOOM = 30;
    const MAX_ZOOM = 120;

    // Week navigation
    let currentWeekOffset = 0;
    const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

    // Generate time slots
    const timeSlots = Array.from({ length: 24 }, (_, i) => {
        const hour = i.toString().padStart(2, '0');
        return `${hour}:00`;
    });

    // Calculate current week dates
    $: weekDates = getWeekDates(currentWeekOffset);

    // Calculate current week start for major tasks
    $: if (weekDates.length > 0) {
        currentWeekStart = getWeekStart(weekDates[0]);
    }

    // Build events index from store
    $: {
        eventsIndex = {};
        $subtasks.forEach(event => {
            const key = `${event.date}|${event.startTime}`;
            eventsIndex[key] = event;
        });
    }

    function getWeekDates(offset: number): Date[] {
        const today = new Date();
        const currentDay = today.getDay();
        const mondayOffset = currentDay === 0 ? -6 : 1 - currentDay;
        const monday = new Date(today);
        monday.setDate(today.getDate() + mondayOffset + offset * 7);

        return Array.from({ length: 7 }, (_, i) => {
            const date = new Date(monday);
            date.setDate(monday.getDate() + i);
            return date;
        });
    }

    function formatDate(date: Date): string {
        return date.getDate().toString();
    }

    function isToday(date: Date): boolean {
        const today = new Date();
        return (
            date.getDate() === today.getDate() &&
            date.getMonth() === today.getMonth() &&
            date.getFullYear() === today.getFullYear()
        );
    }

    function formatWeekRange(dates: Date[]): string {
        if (dates.length === 0) return '';
        const start = dates[0];
        const end = dates[6];
        const monthNames = [
            'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
            'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
        ];
        const startStr = `${monthNames[start.getMonth()]} ${start.getDate()}`;
        const endStr = `${monthNames[end.getMonth()]} ${end.getDate()}`;
        return `${startStr} - ${endStr}`;
    }

    function handleCellClick(date: string, time: string) {
        const key = `${date}|${time}`;
        const existing = eventsIndex[key];

        if (existing) {
            openViewModal(existing, date, time);
        } else {
            openCreateModal(date, time);
        }
    }

    function openCreateModal(date: string, startTime: string) {
        modalMode = 'create';
        targetDate = date;
        targetStartTime = startTime;

        const [hours, minutes] = startTime.split(':').map(Number);
        const endHours = (hours + 1) % 24;
        const endTime = `${endHours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;

        startTimeInput = startTime;
        endTimeInput = endTime;
        titleInput = '';
        descriptionInput = '';
        selectedEvent = null;
        showModal = true;
    }

    function openViewModal(event: Subtask, date: string, startTime: string) {
        modalMode = 'view';
        targetDate = date;
        targetStartTime = startTime;
        startTimeInput = event.startTime;
        endTimeInput = event.endTime;
        titleInput = event.title;
        descriptionInput = event.description;
        majorTaskIdInput = event.majorTaskId || '';
        selectedEvent = event;
        showModal = true;
    }

    function handleModalSave() {
        const startMinutes = timeToMinutes(startTimeInput);
        const endMinutes = timeToMinutes(endTimeInput);

        if (endMinutes <= startMinutes) {
            alert('End time must be after start time');
            return;
        }

        if (modalMode === 'create') {
            const newSubtask = createNewSubtask(
                targetDate,
                startTimeInput,
                endTimeInput,
                titleInput,
                descriptionInput,
                'pending',
                majorTaskIdInput
            );
            subtasks.update(tasks => [...tasks, newSubtask]);
        } else if (selectedEvent) {
            updateSubtask(selectedEvent.id, {
                startTime: startTimeInput,
                endTime: endTimeInput,
                title: titleInput,
                description: descriptionInput,
                majorTaskId: majorTaskIdInput
            });
        }
        showModal = false;
    }

    function handleModalDelete() {
        if (selectedEvent) {
            deleteSubtask(selectedEvent.id);
        }
        showModal = false;
    }

    function handleModalClose() {
        showModal = false;
    }

    function handleEventMove(from: { date: string; time: string }, to: { date: string; time: string }) {
        const fromKey = `${from.date}|${from.time}`;
        const event = eventsIndex[fromKey];
        if (event) {
            const startMinutes = timeToMinutes(event.startTime);
            const endMinutes = timeToMinutes(event.endTime);
            const durationMinutes = endMinutes - startMinutes;

            const newStartMinutes = timeToMinutes(to.time);
            const newEndMinutes = newStartMinutes + durationMinutes;

            // If task is completed and moving to a different date, update daily activity
            if (event.status === 'completed' && from.date !== to.date) {
                const duration = getSubtaskDuration(event);
                const completedOnDate = event.completedOnDate || from.date;

                // Remove from old date
                addTimeToDate(completedOnDate, -duration);
                // Add to new date
                addTimeToDate(to.date, duration);

                // Update the completedOnDate to the new date
                updateSubtask(event.id, {
                    date: to.date,
                    startTime: to.time,
                    endTime: minutesToTime(newEndMinutes),
                    completedOnDate: to.date
                });
            } else {
                updateSubtask(event.id, {
                    date: to.date,
                    startTime: to.time,
                    endTime: minutesToTime(newEndMinutes)
                });
            }
        }
    }

    function handleSubtaskClick(subtask: Subtask) {
        openViewModal(subtask, subtask.date, subtask.startTime);
    }

    function handleStatusChange(eventId: number, newStatus: 'pending' | 'completed' | 'cancelled') {
        const event = $subtasks.find(e => e.id === eventId);
        if (!event) return;

        const oldStatus = event.status;

        // If marking as completed, add time to the task's scheduled date
        if (newStatus === 'completed' && oldStatus !== 'completed') {
            // Check if task is within 24 hours of being due
            const taskDate = new Date(event.date + 'T' + event.endTime);
            const now = new Date();
            const hoursSinceDue = (now.getTime() - taskDate.getTime()) / (1000 * 60 * 60);

            // Only add time if within 24 hours of due time
            if (hoursSinceDue <= 24) {
                const duration = getSubtaskDuration(event);
                addTimeToDate(event.date, duration);
                // Store which date it was completed on
                updateSubtask(eventId, { status: newStatus, completedOnDate: event.date });
            } else {
                // Just update status without adding time
                updateSubtask(eventId, { status: newStatus });
            }
            return;
        }

        // If unmarking as completed, subtract time from the date it was originally completed on
        if (oldStatus === 'completed' && newStatus !== 'completed') {
            const duration = getSubtaskDuration(event);
            const completedOnDate = event.completedOnDate || event.date;
            addTimeToDate(completedOnDate, -duration);
        }

        updateSubtask(eventId, { status: newStatus });
    }

    function handleSubtaskResize(eventId: number, newStartMinutes: number, newEndMinutes: number) {
        updateSubtask(eventId, {
            startTime: minutesToTime(newStartMinutes),
            endTime: minutesToTime(newEndMinutes)
        });
    }

    function toggleAddOptions() {
        showAddOptions = !showAddOptions;
    }

    function handleAddMajorTask() {
        showAddOptions = false;
        showMajorTaskModal = true;
    }

    function handleAddSubtask() {
        showAddOptions = false;
        const today = new Date().toISOString().split('T')[0];
        openCreateModal(today, '09:00');
    }

    function handleCreateMajorTask(event: CustomEvent) {
        if (currentWeekStart) {
            const taskData = event.detail;
            const newTask = createNewTask(
                currentWeekStart,
                taskData.title,
                taskData.description,
                taskData.color,
                taskData.startDay,
                taskData.endDay
            );
            majorTasks.update(tasks => [...tasks, newTask]);
        }
        showMajorTaskModal = false;
    }

    function handleCloseMajorTaskModal() {
        showMajorTaskModal = false;
    }

    function zoomIn() {
        pixelsPerHour = Math.min(MAX_ZOOM, pixelsPerHour + 10);
    }

    function zoomOut() {
        pixelsPerHour = Math.max(MIN_ZOOM, pixelsPerHour - 10);
    }

    function resetZoom() {
        pixelsPerHour = 60;
    }

    function prevWeek() {
        currentWeekOffset--;
    }

    function nextWeek() {
        currentWeekOffset++;
    }

    function goToToday() {
        currentWeekOffset = 0;
    }

    function handleMonthDayClick(date: Date) {
        const clickedMonday = new Date(date);
        const dayOfWeek = clickedMonday.getDay();
        const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
        clickedMonday.setDate(clickedMonday.getDate() + mondayOffset);

        const today = new Date();
        const currentMonday = new Date(today);
        const currentDay = today.getDay();
        const currentMondayOffset = currentDay === 0 ? -6 : 1 - currentDay;
        currentMonday.setDate(today.getDate() + currentMondayOffset);

        const diffTime = clickedMonday.getTime() - currentMonday.getTime();
        const diffWeeks = Math.round(diffTime / (1000 * 60 * 60 * 24 * 7));

        currentWeekOffset = diffWeeks;
    }
</script>

<div class="calendar-shell">
    <MonthSidebar selectedDate={new Date()}/>

    <div class="calendar-container">
        <div class="calendar-header">
            <button on:click={prevWeek}>←</button>
            <button on:click={goToToday}>Today</button>
            <div class="week-display">{formatWeekRange(weekDates)}</div>
            <button on:click={nextWeek}>→</button>

            <div class="zoom-controls">
                <button on:click={zoomOut} title="Zoom out">−</button>
                <button on:click={resetZoom} title="Reset zoom">⊙</button>
                <button on:click={zoomIn} title="Zoom in">+</button>
            </div>
        </div>

        <CalendarGrid
                {weekDates}
                {timeSlots}
                {daysOfWeek}
                {eventsIndex}
                {pixelsPerHour}
                {handleCellClick}
                {formatDate}
                {isToday}
                onEventMove={handleEventMove}
                onSubtaskClick={handleSubtaskClick}
                onSubtaskResize={handleSubtaskResize}
                onStatusChange={handleStatusChange}
        />

        <EventModal
                {showModal}
                {modalMode}
                {targetDate}
                bind:startTimeInput
                bind:endTimeInput
                bind:titleInput
                bind:descriptionInput
                bind:majorTaskIdInput
                onClose={handleModalClose}
                onSave={handleModalSave}
                onDelete={handleModalDelete}
        />

        <MajorItemModal
                bind:showModal={showMajorTaskModal}
                on:create={handleCreateMajorTask}
                on:close={handleCloseMajorTaskModal}
        />
    </div>

    <!-- Floating Action Button -->
    <div class="fab-container">
        {#if showAddOptions}
            <button class="fab-option" on:click={handleAddMajorTask}>
                <span class="fab-icon">📋</span>
                <span class="fab-label">Major Task</span>
            </button>
            <button class="fab-option" on:click={handleAddSubtask}>
                <span class="fab-icon">✓</span>
                <span class="fab-label">Subtask</span>
            </button>
        {/if}
        <button class="fab-main" on:click={toggleAddOptions} class:active={showAddOptions}>
            {showAddOptions ? '✕' : '+'}
        </button>
    </div>
</div>

<style>
    .calendar-container {
        background: #BEB8E9;
        border-radius: 12px;
        padding: 1rem;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        position: relative;
    }

    .calendar-header {
        display: flex;
        gap: 1rem;
        align-items: center;
        margin-bottom: 1rem;
        padding: 0.5rem;
    }

    .calendar-header button {
        padding: 0.5rem 1rem;
        border: 1px solid #ddd;
        background: white;
        border-radius: 6px;
        cursor: pointer;
        font-weight: 600;
    }

    .calendar-header button:hover {
        background: #f5f5f5;
    }

    .week-display {
        flex: 1;
        text-align: center;
        font-weight: 600;
        font-size: 1.125rem;
    }

    .zoom-controls {
        display: flex;
        gap: 0.25rem;
        border: 1px solid #ddd;
        border-radius: 6px;
        overflow: hidden;
    }

    .zoom-controls button {
        padding: 0.5rem 0.75rem;
        border: none;
        border-radius: 0;
        border-right: 1px solid #ddd;
        font-size: 1rem;
        min-width: 40px;
    }

    .zoom-controls button:last-child {
        border-right: none;
    }

    .fab-container {
        position: fixed;
        bottom: 32px;
        left: 32px;
        display: flex;
        flex-direction: column;
        align-items: flex-start;
        gap: 12px;
        z-index: 9999;
    }

    .fab-main {
        width: 56px;
        height: 56px;
        border-radius: 50%;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        border: none;
        font-size: 24px;
        font-weight: 300;
        cursor: pointer;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
        transition: transform 0.3s, box-shadow 0.3s;
        display: flex;
        align-items: center;
        justify-content: center;
    }

    .fab-main:hover {
        transform: scale(1.1);
        box-shadow: 0 6px 16px rgba(0, 0, 0, 0.4);
    }

    .fab-main.active {
        transform: rotate(45deg);
    }

    .fab-option {
        display: flex;
        align-items: center;
        gap: 10px;
        background: white;
        color: #333;
        border: 2px solid #333;
        border-radius: 20px;
        padding: 10px 16px;
        font-size: 0.875rem;
        font-weight: 600;
        cursor: pointer;
        white-space: nowrap;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        transition: transform 0.2s, box-shadow 0.2s;
        animation: slideUp 0.3s ease-out;
    }

    .fab-option:hover {
        transform: translateY(-2px);
        box-shadow: 0 6px 16px rgba(0, 0, 0, 0.25);
    }

    .fab-icon {
        font-size: 1.125rem;
    }

    .fab-label {
        font-weight: 600;
    }

    @keyframes slideUp {
        from {
            opacity: 0;
            transform: translateY(10px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
</style>
