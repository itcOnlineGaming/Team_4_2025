
<script lang="ts">
    import { afterUpdate, onMount, onDestroy } from 'svelte';
    import './style.css';
    export let weekDates: Date[];
    export let timeSlots: string[];
    export let daysOfWeek: string[];
    export let eventsIndex: Record<string, any>;
    export let pixelsPerHour: number;
    export const handleCellClick: (date: string, time: string) => void = () => {};
    export let formatDate: (date: Date) => string;
    export let isToday: (date: Date) => boolean;
    export let onEventMove: (from: {date: string, time: string}, to: {date: string, time: string}) => void;
    export let onSubtaskClick: (subtask: any) => void;
    export let onSubtaskResize: (eventId: number, newStartMinutes: number, newEndMinutes: number) => void;
    export let onStatusChange: (eventId: number, newStatus: 'pending' | 'completed' | 'cancelled') => void;

    import TimeLine from './TIMELINE/timeLine.svelte';
    import SubtaskCard from './SubtaskCard.svelte';

    let currentHour = new Date().getHours();
    let draggedSubtaskKey: string | null = null;
    let draggedFromKey: string | null = null;
    let gridBodyElement: HTMLElement;

    function isPastDate(date: Date): boolean {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const checkDate = new Date(date);
        checkDate.setHours(0, 0, 0, 0);
        return checkDate < today;
    }

    function handleSubtaskDragStart(key: string) {
        draggedSubtaskKey = key;
        draggedFromKey = key;
    }

    function handleCellDrop(date: string, time: string) {
        if (!draggedSubtaskKey) return;

        const fromParts = draggedSubtaskKey.split('|');
        const from = { date: fromParts[0], time: fromParts[1] };
        const to = { date, time };

        // Allow dropping back to same cell
        if (from.date === to.date && from.time === to.time) {
            draggedSubtaskKey = null;
            draggedFromKey = null;
            return;
        }

        // Don't trigger move if dropped on occupied cell
        const targetKey = `${date}|${time}`;
        if (eventsIndex[targetKey]) {
            draggedSubtaskKey = null;
            draggedFromKey = null;
            return;
        }

        onEventMove(from, to);
        draggedSubtaskKey = null;
        draggedFromKey = null;
    }

    function handleSubtaskCardClick(subtask: any) {
        onSubtaskClick(subtask);
    }

    // Draw lines from each subtask to its major task
    function drawLines() {
        const svg = document.getElementById('subtask-major-lines');
        const gridHeader = document.querySelector('.grid-header') as HTMLElement;
        if (!svg || !gridHeader) {
            console.log('SVG element or grid header not found');
            return;
        }
        
        const headerHeight = gridHeader.offsetHeight;
        
        // Clear previous lines
        while (svg.firstChild) svg.removeChild(svg.firstChild);

        console.log('Drawing lines, eventsIndex:', eventsIndex);
        
        Object.values(eventsIndex).forEach((subtask: any) => {
            console.log('Checking subtask:', subtask.id, 'majorTaskId:', subtask.majorTaskId);
            if (!subtask.majorTaskId) return;
            
            const subtaskEl = document.getElementById('subtask-' + subtask.id);
            const majorTaskEl = document.getElementById('major-task-' + subtask.majorTaskId);
            
            console.log('Elements found:', {
                subtaskEl: !!subtaskEl,
                majorTaskEl: !!majorTaskEl,
                subtaskId: 'subtask-' + subtask.id,
                majorTaskId: 'major-task-' + subtask.majorTaskId
            });
            
            if (!subtaskEl || !majorTaskEl) return;

            // Get bounding boxes
            const subRect = subtaskEl.getBoundingClientRect();
            const majorRect = majorTaskEl.getBoundingClientRect();
            const svgRect = svg.getBoundingClientRect();

            // Calculate positions, ensuring lines stay below header
            const startX = subRect.left + subRect.width / 2 - svgRect.left;
            const startY = Math.max(subRect.top - svgRect.top, headerHeight);
            const endX = majorRect.left + majorRect.width / 2 - svgRect.left;
            const endY = majorRect.bottom - svgRect.top;

            // Don't draw if subtask is scrolled above header
            if (subRect.top < svgRect.top + headerHeight) return;

            console.log('Drawing line from', {startX, startY}, 'to', {endX, endY});

            // Get major task color from computed style
            const computedStyle = window.getComputedStyle(majorTaskEl);
            const color = computedStyle.backgroundColor || '#333';

            // Create SVG line
            const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
            line.setAttribute('x1', startX.toString());
            line.setAttribute('y1', startY.toString());
            line.setAttribute('x2', endX.toString());
            line.setAttribute('y2', endY.toString());
            line.setAttribute('stroke', color);
            line.setAttribute('stroke-width', '3');
            line.setAttribute('opacity', '0.8');
            line.setAttribute('pointer-events', 'none');
            svg.appendChild(line);
            
            console.log('Line created with color:', color);
        });
    }
    
    afterUpdate(() => {
        drawLines();
    });
    
    onMount(() => {
        // Redraw lines on scroll
        if (gridBodyElement) {
            gridBodyElement.addEventListener('scroll', drawLines);
        }
    });
    
    onDestroy(() => {
        if (gridBodyElement) {
            gridBodyElement.removeEventListener('scroll', drawLines);
        }
    });
</script>

<div class="calendar-grid">
    <!-- SVG overlay for subtask-major task lines - positioned to stay with calendar, clipped by grid -->
    <svg id="subtask-major-lines" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; pointer-events: none; z-index: 50; clip-path: inset(0 0 0 0);"></svg>
    
    <div class="grid-header">
        <div class="time-column-header"></div>
        {#each weekDates as date, index}
            <div class="day-header" class:today={isToday(date)} class:past={isPastDate(date)}>
                <div class="day-name">{daysOfWeek[index].toUpperCase()}</div>
                <div class="day-number" class:today-number={isToday(date)}>
                    {formatDate(date)}
                </div>
            </div>
        {/each}
    </div>

    <TimeLine {weekDates} />

    <div class="grid-body" bind:this={gridBodyElement} style="--pixels-per-hour: {pixelsPerHour}px; position: relative;">
        {#each timeSlots as timeSlot, timeIndex}
            <div class="time-row" style="height: {pixelsPerHour}px;">
                <div class="time-slot">{timeSlot}</div>
                {#each weekDates as date, dayIndex}
                    {@const dateStr = date.toISOString().split('T')[0]}
                    {@const key = `${dateStr}|${timeSlot}`}
                    <div
                            class="calendar-cell"
                            class:current-hour={isToday(date) && currentHour === timeIndex}
                            class:past-cell={isPastDate(date)}
                            class:drop-target={draggedSubtaskKey && key !== draggedFromKey && !eventsIndex[key]}
                            on:mouseup={() => handleCellDrop(dateStr, timeSlot)}
                            role="gridcell"
                            tabindex="-1"
                    >
                        <!-- Empty timeline cell -->
                    </div>
                {/each}
            </div>
        {/each}

        <!-- Floating subtasks layer - using grid layout to match cells -->
        <div class="subtasks-layer" style="grid-template-rows: repeat({timeSlots.length}, {pixelsPerHour}px);">
            {#each Object.values(eventsIndex) as subtask}
                {@const dayIndex = weekDates.findIndex(d => d.toISOString().split('T')[0] === subtask.date)}
                {@const timeIndex = timeSlots.findIndex(t => t === subtask.startTime)}
                {#if dayIndex !== -1 && timeIndex !== -1}
                    <SubtaskCard
                            {subtask}
                            {pixelsPerHour}
                            gridColumn={dayIndex + 1}
                            gridRow={timeIndex + 1}
                            isBeingDragged={draggedSubtaskKey === `${subtask.date}|${subtask.startTime}`}
                            onDragStart={() => handleSubtaskDragStart(`${subtask.date}|${subtask.startTime}`)}
                            onClick={() => handleSubtaskCardClick(subtask)}
                            onResize={(newStartMinutes, newEndMinutes) => onSubtaskResize(subtask.id, newStartMinutes, newEndMinutes)}
                            onStatusChange={(newStatus) => onStatusChange(subtask.id, newStatus)}
                    />
                {/if}
            {/each}
        </div>
    </div>
</div>

<style>
    .grid-body {
        --pixels-per-hour: 60px;
    }

    .day-header.past {
        opacity: 0.5;
        background-color: #e0e0e0;
    }

    .calendar-cell.past-cell {
        background-color: #f5f5f5;
        opacity: 0.6;
    }
</style>
