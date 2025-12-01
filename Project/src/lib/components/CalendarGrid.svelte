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
    export let handleCellClick: (date: string, time: string) => void;
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
    let lastTouchX: number = 0;
    let lastTouchY: number = 0;

    // Subtask creation modal state
    let showSubtaskModal = false;
    let newSubtaskDate = '';
    let newSubtaskTime = '';
    let newSubtaskTitle = '';

    import { createNewSubtask, subtasks } from '../stores/subtasks';

    function handleCreateSubtask() {
        const newSubtask = createNewSubtask(
            newSubtaskDate,
            newSubtaskTime,
            newSubtaskTime,
            newSubtaskTitle,
            '',
            'pending'
        );
        subtasks.update(tasks => [...tasks, newSubtask]);
        showSubtaskModal = false;
    }

    function openSubtaskModal(date: string, time: string) {
        console.log('openSubtaskModal called:', date, time);
        // Only open modal if we're not in a drag operation
        if (!draggedSubtaskKey) {
            handleCellClick(date, time);
        }
    }

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

    function handleSubtaskDragEnd() {
        // Reset drag state when drag operation ends (whether successful or cancelled)
        draggedSubtaskKey = null;
        draggedFromKey = null;
    }

    function handleCellDrop(date: string, time: string, fromTouch: boolean = false) {
        if (!draggedSubtaskKey) return;

        // If this is from a touch event, use the last touch coordinates to find the actual target cell
        let targetDate = date;
        let targetTime = time;

        if (fromTouch && lastTouchX && lastTouchY) {
            const element = document.elementFromPoint(lastTouchX, lastTouchY);
            const cell = element?.closest('.calendar-cell');

            if (cell) {
                // Extract date and time from the cell's data or position
                const cellIndex = Array.from(cell.parentElement?.children || []).indexOf(cell as Element) - 1;
                const rowElement = cell.closest('.time-row');
                const rowIndex = Array.from(gridBodyElement.querySelectorAll('.time-row')).indexOf(rowElement as Element);

                if (cellIndex >= 0 && rowIndex >= 0 && cellIndex < weekDates.length) {
                    targetDate = weekDates[cellIndex].toISOString().split('T')[0];
                    targetTime = timeSlots[rowIndex];
                }
            }
        }

        const fromParts = draggedSubtaskKey.split('|');
        const from = { date: fromParts[0], time: fromParts[1] };
        const to = { date: targetDate, time: targetTime };

        // Allow dropping back to same cell
        if (from.date === to.date && from.time === to.time) {
            draggedSubtaskKey = null;
            draggedFromKey = null;
            return;
        }

        // Don't trigger move if dropped on occupied cell
        const targetKey = `${targetDate}|${targetTime}`;
        if (eventsIndex[targetKey]) {
            draggedSubtaskKey = null;
            draggedFromKey = null;
            return;
        }

        onEventMove(from, to);

        // After drag-and-drop, rescale major task bar to fit subtasks
        // Find all subtasks for the same major task
        setTimeout(() => {
            // Always update startDay and endDay to reflect all linked subtasks
            const movedSubtask = Object.values(eventsIndex).find((s: any) => s.date === to.date && s.startTime === to.time);
            if (movedSubtask && movedSubtask.majorTaskId) {
                const allLinkedSubtasks = Object.values(eventsIndex).filter((s: any) => s.majorTaskId === movedSubtask.majorTaskId);
                const dayIndices = allLinkedSubtasks.map((s: any) => {
                    const idx = weekDates.findIndex(d => d.toISOString().split('T')[0] === s.date);
                    return idx + 1; // startDay/endDay are 1-based
                }).filter(idx => idx > 0);
                if (dayIndices.length > 0) {
                    const minDay = Math.min(...dayIndices);
                    const maxDay = Math.max(...dayIndices);
                    import('../stores/majorTasks').then(mod => {
                        mod.updateMajorTask(movedSubtask.majorTaskId, { startDay: minDay, endDay: maxDay });
                    });
                }
            }
        }, 0);

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
            if (hoveredSubId !== null || hoveredMajorId !== null) {
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

        // Recalculate major task startDay/endDay for all major tasks when eventsIndex changes
        setTimeout(() => {
            const majorTaskIds = Array.from(new Set(Object.values(eventsIndex).map((s: any) => s.majorTaskId).filter(Boolean)));
            for (const majorTaskId of majorTaskIds) {
                const allLinkedSubtasks = Object.values(eventsIndex).filter((s: any) => s.majorTaskId === majorTaskId);
                const dayIndices = allLinkedSubtasks.map((s: any) => {
                    const idx = weekDates.findIndex(d => d.toISOString().split('T')[0] === s.date);
                    return idx + 1;
                }).filter(idx => idx > 0);
                if (dayIndices.length > 0) {
                    const minDay = Math.min(...dayIndices);
                    const maxDay = Math.max(...dayIndices);
                    import('../stores/majorTasks').then(mod => {
                        mod.updateMajorTask(majorTaskId, { startDay: minDay, endDay: maxDay });
                    });
                }
            }
        }, 0);
    });

    // Subscribe to hoveredSubtaskId and hoveredMajorTaskId to redraw lines on highlight/dim change
    const unsubHoverSub = hoveredSubtaskId.subscribe(() => drawLines());
    const unsubHoverMajor = hoveredMajorTaskId.subscribe(() => drawLines());

    let resizeObservers: ResizeObserver[] = [];

    onMount(() => {
        // Redraw lines on scroll
        if (gridBodyElement) {
            gridBodyElement.addEventListener('scroll', drawLines);
        }

        // Track touch coordinates during drag
        const handleTouchMove = (e: TouchEvent) => {
            if (draggedSubtaskKey && e.touches.length > 0) {
                lastTouchX = e.touches[0].clientX;
                lastTouchY = e.touches[0].clientY;
            }
        };
        document.addEventListener('touchmove', handleTouchMove);

        // Observe size changes for all subtask and major task elements
        setTimeout(() => {
            const subtaskEls = Array.from(document.querySelectorAll('[id^="subtask-"]'));
            const majorTaskEls = Array.from(document.querySelectorAll('[id^="major-task-"]'));
            [...subtaskEls, ...majorTaskEls].forEach(el => {
                const observer = new ResizeObserver(() => drawLines());
                observer.observe(el);
                resizeObservers.push(observer);
            });
        }, 500);

        // Add global mouseup/touchend listeners to catch cancelled drags
        const handleGlobalEnd = (e: MouseEvent | TouchEvent) => {
            if (draggedSubtaskKey) {
                // For touch events, try to determine where the touch ended
                if (e instanceof TouchEvent && e.changedTouches.length > 0) {
                    lastTouchX = e.changedTouches[0].clientX;
                    lastTouchY = e.changedTouches[0].clientY;

                    // Find the element at the touch point
                    const element = document.elementFromPoint(lastTouchX, lastTouchY);
                    const cell = element?.closest('.calendar-cell');

                    if (cell) {
                        // Extract date and time from the cell's position
                        const cellIndex = Array.from(cell.parentElement?.children || []).indexOf(cell as Element) - 1;
                        const rowElement = cell.closest('.time-row');
                        const rowIndex = Array.from(gridBodyElement.querySelectorAll('.time-row')).indexOf(rowElement as Element);

                        if (cellIndex >= 0 && rowIndex >= 0 && cellIndex < weekDates.length) {
                            const targetDate = weekDates[cellIndex].toISOString().split('T')[0];
                            const targetTime = timeSlots[rowIndex];
                            handleCellDrop(targetDate, targetTime, true);
                            return;
                        }
                    }
                }

                console.log('Global end event - resetting drag state');
                draggedSubtaskKey = null;
                draggedFromKey = null;
            }
        };
        document.addEventListener('mouseup', handleGlobalEnd);
        document.addEventListener('touchend', handleGlobalEnd);

        return () => {
            document.removeEventListener('mouseup', handleGlobalEnd);
            document.removeEventListener('touchend', handleGlobalEnd);
            document.removeEventListener('touchmove', handleTouchMove);
        };
    });

    onDestroy(() => {
        if (gridBodyElement) {
            gridBodyElement.removeEventListener('scroll', drawLines);
        }
        resizeObservers.forEach(obs => obs.disconnect());
        resizeObservers = [];
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

                <!-- Custom modal removed. Use parent modal logic. -->
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
                            on:click={(event) => { event.stopPropagation(); openSubtaskModal(dateStr, timeSlot); }}
                            on:dragover={(e) => e.preventDefault()}
                            style="background: rgba(255,255,255,0.01); cursor: pointer;"
                            role="gridcell"
                            tabindex="0"
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
                {#if dayIndex !== -1}
                    <SubtaskCard
                            {subtask}
                            {pixelsPerHour}
                            gridColumn={dayIndex + 1}
                            gridRow={1}
                            isBeingDragged={draggedSubtaskKey === `${subtask.date}|${subtask.startTime}`}
                            onDragStart={() => handleSubtaskDragStart(`${subtask.date}|${subtask.startTime}`)}
                            onDragEnd={handleSubtaskDragEnd}
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