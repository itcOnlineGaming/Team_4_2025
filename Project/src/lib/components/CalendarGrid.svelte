
<script lang="ts">
    import { afterUpdate, onMount, onDestroy } from 'svelte';
    import './style.css';
    import { hoveredSubtaskId, hoveredMajorTaskId } from '../stores/hoverHighlight';
    import { get } from 'svelte/store';
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
    import { page } from '$app/state';

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
const uniqueTaskId : number[] = [];
    // Draw lines from each subtask to its major task
    // ... rest of script ...

    function drawLines() 
    {
        if (typeof window === "undefined") return;
        uniqueTaskId.length = 0; // Clear uniqueTaskId array
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

        // Get hovered values
        const hoveredSubId = get(hoveredSubtaskId);
        const hoveredMajorId = get(hoveredMajorTaskId);
        
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
            
            var amountOfLinesOffset = 0;
            let found = false;

            for (let id of uniqueTaskId) 
            {
                if (id === subtask.majorTaskId) 
                {
                    found = true;
                    break;
                }
                amountOfLinesOffset += 1;
            }
            
            if (!found) 
            {
                uniqueTaskId.push(subtask.majorTaskId);
            }

            if (!subtaskEl || !majorTaskEl) return;

            // Get bounding boxes
            const subRect = subtaskEl.getBoundingClientRect();
            const majorRect = majorTaskEl.getBoundingClientRect();
            const svgRect = svg.getBoundingClientRect();
            
            console.log("Amount of lines : " + amountOfLinesOffset);

            // Calculate positions: line starts a few pixels to the left of the subtask and goes straight up
            const startX = subRect.left - svgRect.left - 8 + (amountOfLinesOffset * 5); // 8px to the left of subtask
            const startY = Math.max(subRect.top - svgRect.top + (subRect.height / 2), headerHeight);
            const endX = startX;
            const endY = Math.max(majorRect.top - svgRect.top + 4, headerHeight); // 4px offset from top of major task

            // Don't draw if subtask is scrolled above header
            if (subRect.top < svgRect.top + headerHeight) return;

            console.log('Drawing line from', {startX, startY}, 'to', {endX, endY});

            // Get major task color from computed style
            const computedStyle = window.getComputedStyle(majorTaskEl);
            const color = computedStyle.backgroundColor || '#333';

            // Determine if this line should be highlighted or dimmed
            let lineOpacity = 0.9;
            let lineFilter = '';
            if (hoveredSubId !== null) {
                const isHighlighted = (hoveredSubId === subtask.id || hoveredMajorId === subtask.majorTaskId);
                if (!isHighlighted) {
                    lineOpacity = 0.3;
                    lineFilter = 'grayscale(0.7) brightness(0.7)';
                }
            }

            // Create SVG line
            const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
            line.setAttribute('x1', startX.toString());
            line.setAttribute('y1', startY.toString());
            line.setAttribute('x2', endX.toString());
            line.setAttribute('y2', endY.toString());
            line.setAttribute('stroke', color);
            line.setAttribute('stroke-width', '3');
            line.setAttribute('opacity', lineOpacity.toString());
            line.setAttribute('pointer-events', 'none');
            line.setAttribute('z-index', '50');
            if (lineFilter) line.setAttribute('style', `filter: ${lineFilter};`);
            svg.appendChild(line);

            const line2x = startX + 15;

            const line2 = document.createElementNS('http://www.w3.org/2000/svg', 'line');
            line2.setAttribute('x1', line2x.toString());
            line2.setAttribute('y1', startY.toString());
            line2.setAttribute('x2', startX.toString());
            line2.setAttribute('y2', startY.toString());
            line2.setAttribute('stroke', color);
            line2.setAttribute('stroke-width', '3');
            line2.setAttribute('opacity', lineOpacity.toString());
            line2.setAttribute('pointer-events', 'none');
            line2.setAttribute('z-index', '50');
            if (lineFilter) line2.setAttribute('style', `filter: ${lineFilter};`);

            svg.appendChild(line2);

            svg.style.zIndex = '1';
            
            console.log('Line created with color:', color);
        });
    }
    
    afterUpdate(() => {
        drawLines();
    });

    // Subscribe to hoveredSubtaskId and hoveredMajorTaskId to redraw lines on highlight/dim change
    const unsubHoverSub = hoveredSubtaskId.subscribe(() => drawLines());
    const unsubHoverMajor = hoveredMajorTaskId.subscribe(() => drawLines());

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
        unsubHoverSub();
        unsubHoverMajor();
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
        <!-- Overlay removed: only .dimmed class will be used for non-highlighted elements -->
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
    /* .subtask-hover-overlay removed */
</style>
