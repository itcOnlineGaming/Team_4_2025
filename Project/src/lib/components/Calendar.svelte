<script lang="ts">
    import CalendarGrid from './CalendarGrid.svelte';
    import EventModal from './EventModal.svelte';
    import MajorItemModal from './TIMELINE/MajorItemModal.svelte';
    import ReminderModal from './ReminderModal.svelte';

    import MonthCalendar from './MonthCalendar.svelte';
    import ExternalSidebar from './ExternalSidebar.svelte';
    import Tutorial from './Tutorial.svelte';
    import type { QuickTool } from './external-sidebar/types';
    import {
        subtasks,
        createNewSubtask,
        deleteSubtask,
        updateSubtask,
        timeToMinutes,
        minutesToTime,
        type Subtask,
        getSubtaskDuration,
        createRecurringTask,
        deleteRecurringTask,
        updateRecurringTask
    } from '../stores/subtasks';
    import { majorTasks, createNewTask, getWeekStart } from '../stores/majorTasks';
    import { addTimeToDate, repopulateFromCompletedTasks, dailyActivity } from '../stores/dailyActivity';
    import { onMount } from 'svelte';
    import { 
        notifyEventCreated, 
        notifyEventModified, 
        notifyEventDeleted,
        snoozeReminder,
        checkUpcomingEvents,
        ensureNotificationPermission 
    } from '../eventNotifications';

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
    let priorityInput: 'high' | 'medium' | 'low' = 'medium';
    let showAddOptions = false;
    let currentWeekStart = '';
    let majorTaskIdInput = '';
    
    // Recurring event state
    let isRecurring = false;
    let recurrencePattern: 'daily' | 'weekly' | 'monthly' = 'daily';
    let recurrenceEndDate = '';

    // Month calendar state
    let selectedDate = new Date();
    let calendarViewDate = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1);

    // External sidebar state (always visible, but collapsible)
    let externalSidebarVisible = true;
    let sidebarCollapsed = false;
    
    // Tutorial modal state
    let showTutorial = false;
    
    function handleSidebarToggle(event: CustomEvent<{ collapsed: boolean }>) {
        sidebarCollapsed = event.detail.collapsed;
    }
    
    function handleOpenTutorial() {
        console.log('handleOpenTutorial called');
        showTutorial = true;
        console.log('showTutorial is now:', showTutorial);
    }
    
    function handleTutorialComplete() {
        showTutorial = false;
    }
    
    // Quick Tools for sidebar
    const quickTools: QuickTool[] = [
        { id: 'complete', label: 'Complete', icon: '✅', category: 'status', color: '#22c55e' },
        { id: 'in-progress', label: 'In Progress', icon: '🔄', category: 'status', color: '#3b82f6' },
        { id: 'pending', label: 'Pending', icon: '⏳', category: 'status', color: '#6b7280' },
        { id: 'high-priority', label: 'High Priority', icon: '🔴', category: 'priority', color: '#ef4444' },
        { id: 'medium-priority', label: 'Medium Priority', icon: '🟡', category: 'priority', color: '#f59e0b' },
        { id: 'low-priority', label: 'Low Priority', icon: '🟢', category: 'priority', color: '#10b981' },
        { id: 'delete', label: 'Delete', icon: '🗑️', category: 'action', color: '#dc2626' },
        { id: 'duplicate', label: 'Duplicate', icon: '📋', category: 'action', color: '#8b5cf6' },
    ];

    function handleQuickToolAction(event: CustomEvent<{ toolId: string; item: any }>) {
        const { toolId, item } = event.detail;
        
        switch (toolId) {
            case 'complete':
                updateSubtask(item.id, { status: 'completed' });
                break;
            case 'in-progress':
                // Note: 'in-progress' may not be valid status, using pending instead
                updateSubtask(item.id, { status: 'pending' });
                break;
            case 'pending':
                updateSubtask(item.id, { status: 'pending' });
                break;
            case 'high-priority':
                updateSubtask(item.id, { priority: 'high' });
                break;
            case 'medium-priority':
                updateSubtask(item.id, { priority: 'medium' });
                break;
            case 'low-priority':
                updateSubtask(item.id, { priority: 'low' });
                break;
            case 'delete':
                if (confirm(`Delete "${item.title}"?`)) {
                    deleteSubtask(item.id);
                }
                break;
            case 'duplicate':
                const duration = getSubtaskDuration(item);
                createNewSubtask(
                    item.date,
                    item.startTime,
                    `${item.title} (Copy)`,
                    item.description,
                    minutesToTime(duration),
                    item.priority,
                    item.majorTaskId
                );
                break;
        }
    }
    
    // Transform subtasks for sidebar filtering
    $: sidebarItems = $subtasks.map(task => ({
        id: task.id,
        title: task.title,
        status: task.status,
        priority: task.priority,
        date: task.date,
        startTime: task.startTime,
        endTime: task.endTime,
        description: task.description
    }));

    // Sidebar filtering state
    let filteredSubtasks: Subtask[] = [];
    let sidebarSelectedFilters: Record<string, string[]> = {};
    let sidebarSelectedSortId: string | null = null;
    let filteredItems: any[] = [];

    // Apply sidebar filters to subtasks and update what's displayed in calendar
    $: {
        let filtered = [...$subtasks];
        
        // Apply status filter
        if (sidebarSelectedFilters.status && sidebarSelectedFilters.status.length > 0) {
            filtered = filtered.filter(task => sidebarSelectedFilters.status.includes(task.status));
        }
        
        // Apply priority filter
        if (sidebarSelectedFilters.priority && sidebarSelectedFilters.priority.length > 0) {
            filtered = filtered.filter(task => sidebarSelectedFilters.priority.includes(task.priority));
        }
        
        // Apply sorting
        if (sidebarSelectedSortId) {
            if (sidebarSelectedSortId === 'date') {
                filtered.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
            } else if (sidebarSelectedSortId === 'status') {
                const statusOrder = { 'pending': 0, 'completed': 1, 'cancelled': 2 };
                filtered.sort((a, b) => statusOrder[a.status] - statusOrder[b.status]);
            } else if (sidebarSelectedSortId === 'priority') {
                const priorityOrder = { 'high': 0, 'medium': 1, 'low': 2 };
                filtered.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);
            }
        }
        
        filteredSubtasks = filtered;
    }

    // Zoom state: pixels per hour (default 60px = 1 hour)
    let pixelsPerHour = 60;
    const MIN_ZOOM = 30;
    const MAX_ZOOM = 120;

    // Week navigation
    let currentWeekOffset = 0;
    let manualNavigation = false; // Track if user is manually navigating
    const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

    // Generate time slots
    const timeSlots = Array.from({ length: 24 }, (_, i) => {
        const hour = i.toString().padStart(2, '0');
        return `${hour}:00`;
    });

    // Calculate current week dates
    $: weekDates = getWeekDates(currentWeekOffset);

    // Update currentWeekOffset when selectedDate changes (from month calendar)
    // but only if not manually navigating
    $: if (selectedDate && !manualNavigation) {
        const today = new Date();
        const currentDay = today.getDay();
        const mondayOffset = currentDay === 0 ? -6 : 1 - currentDay;
        const thisWeekMonday = new Date(today);
        thisWeekMonday.setDate(today.getDate() + mondayOffset);
        
        // Find Monday of the selected date's week
        const selectedDay = selectedDate.getDay();
        const selectedMondayOffset = selectedDay === 0 ? -6 : 1 - selectedDay;
        const selectedWeekMonday = new Date(selectedDate);
        selectedWeekMonday.setDate(selectedDate.getDate() + selectedMondayOffset);
        
        // Calculate week difference
        const diffMs = selectedWeekMonday.getTime() - thisWeekMonday.getTime();
        const diffWeeks = Math.round(diffMs / (7 * 24 * 60 * 60 * 1000));
        
        if (diffWeeks !== currentWeekOffset) {
            currentWeekOffset = diffWeeks;
        }
    }

    // Calculate current week start for major tasks
    $: if (weekDates.length > 0) {
        currentWeekStart = getWeekStart(weekDates[0]);
    }

    // Build events index from filtered subtasks
    $: {
        eventsIndex = {};
        filteredSubtasks.forEach(event => {
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
    
    // If there's a task starting exactly at this time, open it
    if (existing) {
        console.log('handleCellClick: opening view modal for exact match');
        openViewModal(existing, date, time);
        return;
    }
    
    // Otherwise, check if there's any task that overlaps with this hour slot
    const clickedMinutes = timeToMinutes(time);
    const overlappingTask = filteredSubtasks.find(task => {
        if (task.date !== date) return false;
        const taskStart = timeToMinutes(task.startTime);
        const taskEnd = timeToMinutes(task.endTime);
        // Check if the clicked hour is within the task's time range
        return taskStart < clickedMinutes + 60 && taskEnd > clickedMinutes;
    });
    
    if (overlappingTask) {
        console.log('handleCellClick: opening view modal for overlapping task');
        openViewModal(overlappingTask, date, time);
    } else {
        console.log('handleCellClick: opening create modal');
        openCreateModal(date, time);
    }
}

function getTodayDateString(): string {
    const today = new Date();
    return today.toISOString().split('T')[0];
}

function openCreateModal(date: string, startTime: string) {
    console.log('openCreateModal called:', date, startTime);
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
    priorityInput = 'medium';
    isRecurring = false;
    recurrencePattern = 'daily';
    recurrenceEndDate = '';
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
        priorityInput = event.priority;
        isRecurring = event.isRecurring || false;
        recurrencePattern = event.recurrencePattern || 'daily';
        recurrenceEndDate = event.recurrenceEndDate || '';
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
        
        // Validate recurring event end date
        if (isRecurring && !recurrenceEndDate) {
            alert('Please select an end date for the recurring event');
            return;
        }
        
        if (isRecurring && recurrenceEndDate < targetDate) {
            alert('Recurrence end date must be after the start date');
            return;
        }

        if (modalMode === 'create') {
            if (isRecurring) {
                // Create recurring task with all instances
                createRecurringTask(
                    targetDate,
                    startTimeInput,
                    endTimeInput,
                    titleInput,
                    descriptionInput,
                    priorityInput,
                    recurrencePattern,
                    recurrenceEndDate,
                    majorTaskIdInput || undefined
                );
                
                // Get the base task for notification
                const baseTask = $subtasks.find(t => 
                    t.date === targetDate && 
                    t.startTime === startTimeInput && 
                    t.title === titleInput &&
                    t.isRecurring
                );
                if (baseTask) {
                    notifyEventCreated(baseTask);
                }
            } else {
                // Create single task
                const newSubtask = createNewSubtask(
                    targetDate,
                    startTimeInput,
                    endTimeInput,
                    titleInput,
                    descriptionInput,
                    'pending',
                    majorTaskIdInput || undefined,
                    undefined,
                    priorityInput
                );
                subtasks.update(tasks => [...tasks, newSubtask]);
                notifyEventCreated(newSubtask);
            }
        } else if (selectedEvent) {
            const eventId = selectedEvent.id;
            
            // Check if this is a recurring event or instance
            if (selectedEvent.isRecurring || selectedEvent.isRecurrenceInstance) {
                const updateAll = confirm(
                    'Do you want to update all instances of this recurring event?\n\n' +
                    'Click OK to update all instances\n' +
                    'Click Cancel to update only this instance'
                );
                
                updateRecurringTask(eventId, {
                    startTime: startTimeInput,
                    endTime: endTimeInput,
                    title: titleInput,
                    description: descriptionInput,
                    majorTaskId: majorTaskIdInput || undefined,
                    priority: priorityInput
                }, updateAll);
            } else {
                updateSubtask(eventId, {
                    startTime: startTimeInput,
                    endTime: endTimeInput,
                    title: titleInput,
                    description: descriptionInput,
                    majorTaskId: majorTaskIdInput || undefined,
                    priority: priorityInput
                });
            }
            
            const updatedEvent = $subtasks.find(t => t.id === eventId);
            if (updatedEvent) notifyEventModified(updatedEvent);
        }
        showModal = false;
    }

    function handleModalDelete() {
        if (selectedEvent) {
            // Check if this is a recurring event or instance
            if (selectedEvent.isRecurring || selectedEvent.isRecurrenceInstance) {
                const deleteAll = confirm(
                    'Do you want to delete all instances of this recurring event?\n\n' +
                    'Click OK to delete all instances\n' +
                    'Click Cancel to delete only this instance'
                );
                
                notifyEventDeleted(selectedEvent);
                deleteRecurringTask(selectedEvent.id, deleteAll);
            } else {
                notifyEventDeleted(selectedEvent);
                deleteSubtask(selectedEvent.id);
            }
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
                taskData.endDay,
                taskData.priority
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
        manualNavigation = true;
        currentWeekOffset--;
        // Update selectedDate to match the new week
        const newWeekDates = getWeekDates(currentWeekOffset);
        if (newWeekDates.length > 0) {
            selectedDate = new Date(newWeekDates[0]);
        }
        setTimeout(() => manualNavigation = false, 0);
    }

    function nextWeek() {
        manualNavigation = true;
        currentWeekOffset++;
        // Update selectedDate to match the new week
        const newWeekDates = getWeekDates(currentWeekOffset);
        if (newWeekDates.length > 0) {
            selectedDate = new Date(newWeekDates[0]);
        }
        setTimeout(() => manualNavigation = false, 0);
    }

    function goToToday() {
        manualNavigation = true;
        currentWeekOffset = 0;
        // Update selectedDate to today
        selectedDate = new Date();
        setTimeout(() => manualNavigation = false, 0);
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

    // Set up notification permissions and reminder checks
    onMount(() => {
        ensureNotificationPermission();
        
        // Check for upcoming events every 5 minutes
        const reminderInterval = setInterval(() => {
            checkUpcomingEvents($subtasks);
        }, 5 * 60 * 1000);

        // Initial check
        checkUpcomingEvents($subtasks);

        return () => clearInterval(reminderInterval);
    });
</script>

<div class="calendar-shell" class:collapsed={sidebarCollapsed}>
    <!-- External Sidebar with Month Calendar inside -->
    <ExternalSidebar 
        bind:visible={externalSidebarVisible} 
        title="Calendar & Tasks" 
        items={sidebarItems}
        {quickTools}
        onOpenTutorial={handleOpenTutorial}
        bind:selectedFilters={sidebarSelectedFilters}
        bind:selectedSortId={sidebarSelectedSortId}
        bind:filteredItems
        on:toggle={handleSidebarToggle}
        on:quickToolAction={handleQuickToolAction}
    >
        <div slot="calendar">
            <MonthCalendar bind:selectedDate bind:viewDate={calendarViewDate} />
        </div>
        
        <div slot="content">
            <!-- Content slot intentionally empty -->
        </div>
    </ExternalSidebar>

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
                {selectedEvent}
                bind:targetDate
                bind:startTimeInput
                bind:endTimeInput
                bind:titleInput
                bind:descriptionInput
                bind:majorTaskIdInput
                bind:priorityInput
                bind:isRecurring
                bind:recurrencePattern
                bind:recurrenceEndDate
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

<!-- Tutorial Modal -->
{#if showTutorial}
    <Tutorial 
        onComplete={handleTutorialComplete}
    />
{/if}

<style>
    .calendar-shell {
        display: flex;
        gap: 1rem;
        align-items: flex-start;
        margin-left: 320px; /* Account for fixed sidebar */
        transition: margin-left 0.3s ease;
    }
    
    .calendar-shell.collapsed {
        margin-left: 64px; /* Collapsed sidebar width */
    }

    .calendar-container {
        background: #BEB8E9;
        border-radius: 12px;
        padding: 1rem;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        position: relative;
        z-index: 1;
    }

    .calendar-header {
        display: flex;
        gap: 1rem;
        align-items: center;
        margin-bottom: 1rem;
        padding: 0.5rem;
        position: relative;
        z-index: 2;
    }

    .calendar-header button {
        padding: 0.5rem 1rem;
        border: 1px solid #ddd;
        background: white;
        border-radius: 6px;
        cursor: pointer;
        font-weight: 600;
        position: relative;
        z-index: 3;
    }

    .calendar-header button:hover {
        background: #f0f0f0;
        border-color: #999;
    }

    .calendar-header button:active {
        transform: scale(0.95);
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
        position: relative;
        z-index: 3;
    }

    .zoom-controls button {
        padding: 0.5rem 0.75rem;
        border: none;
        border-radius: 0;
        border-right: 1px solid #ddd;
        font-size: 1rem;
        min-width: 40px;
        background: white;
        cursor: pointer;
    }

    .zoom-controls button:hover {
        background: #f0f0f0;
    }

    .zoom-controls button:active {
        transform: scale(0.95);
    }

    .zoom-controls button:last-child {
        border-right: none;
    }

    .fab-container {
        position: fixed;
        bottom: 128px;
        right: 32px;
        display: flex;
        flex-direction: column;
        align-items: flex-end;
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

<ReminderModal />
