<script lang="ts">
    import { majorTasks } from '../stores/majorTasks';
    import { subtasks } from '../stores/subtasks';
    import { get } from 'svelte/store';
    import { hoveredSubtaskId, hoveredMajorTaskId } from '../stores/hoverHighlight';

    export let subtask: any;
    export let gridColumn: number;
    export const gridRow: number = 1; // Keep for backwards compatibility but won't use
    export let pixelsPerHour: number;
    export let isBeingDragged: boolean = false;
    export let onDragStart: (e: MouseEvent) => void;
    export let onDragEnd: () => void;
    export let onClick: () => void;
    export let onResize: (newStartMinutes: number, newEndMinutes: number) => void;
    export let onStatusChange: (newStatus: 'pending' | 'completed' | 'cancelled') => void;

    // Get major task reference and color
    import type { MajorTask } from '../stores/majorTasks';

    let majorTask: MajorTask | null = null;
    let majorTaskColor = '#333';
    $: {
        if (subtask.majorTaskId) {
            majorTask = get(majorTasks).find((t: MajorTask) => t.id === subtask.majorTaskId) || null;
            if (majorTask && majorTask.color) {
                majorTaskColor = majorTask.color;
            } else {
                majorTaskColor = '#333';
            }
        } else {
            majorTask = null;
            majorTaskColor = '#333';
        }
    }

    // Remove subtask linking logic
    // Restore missing logic for positioning, resizing, dragging, and status handling
    const SNAP_INTERVAL = 15;
    const MIN_HEIGHT_FOR_TEXT = 20;
    const DRAG_THRESHOLD = 5;

    let isResizing = false;
    let resizeHandle: 'top' | 'bottom' | null = null;
    let initialStartMinutes = 0;
    let initialEndMinutes = 0;
    let initialY = 0;
    let dragStartX = 0;
    let dragStartY = 0;
    let hasMoved = false;

    // Track visual resize state separately
    let visualStartMinutes = 0;
    let visualEndMinutes = 0;

    function timeToMinutes(timeStr: string): number {
        const [hours, minutes] = timeStr.split(':').map(Number);
        return hours * 60 + minutes;
    }

    function snapToInterval(minutes: number): number {
        return Math.round(minutes / SNAP_INTERVAL) * SNAP_INTERVAL;
    }

    $: startMinutes = isResizing && resizeHandle === 'top' ? visualStartMinutes : timeToMinutes(subtask.startTime);
    $: endMinutes = isResizing && resizeHandle === 'bottom' ? visualEndMinutes : timeToMinutes(subtask.endTime);
    $: durationMinutes = endMinutes - startMinutes;
    $: durationHours = durationMinutes / 60;
    $: showText = (durationHours * pixelsPerHour) >= MIN_HEIGHT_FOR_TEXT;

    // Calculate absolute positioning from minutes
    $: topPosition = (startMinutes / 60) * pixelsPerHour;
    $: height = (durationMinutes / 60) * pixelsPerHour;

    function dragSubtask(node: HTMLElement) {
        let isDragging = false;
        let dragGhost: HTMLElement | null = null;
        let offsetX = 0;
        let offsetY = 0;

        const handleMousedown = (e: MouseEvent) => {
            if ((e.target as HTMLElement).closest('.status-badge') ||
                (e.target as HTMLElement).closest('.resize-handle')) {
                return;
            }

            dragStartX = e.clientX;
            dragStartY = e.clientY;
            hasMoved = false;

            const rect = node.getBoundingClientRect();
            offsetX = e.clientX - rect.left;
            offsetY = e.clientY - rect.top;

            const handleMousemoveStart = (e: MouseEvent) => {
                const deltaX = Math.abs(e.clientX - dragStartX);
                const deltaY = Math.abs(e.clientY - dragStartY);

                if (!isDragging && (deltaX > DRAG_THRESHOLD || deltaY > DRAG_THRESHOLD)) {
                    isDragging = true;
                    hasMoved = true;
                    e.preventDefault();

                    document.body.style.userSelect = 'none';
                    document.body.style.webkitUserSelect = 'none';

                    dragGhost = node.cloneNode(true) as HTMLElement;
                    dragGhost.classList.add('drag-ghost');
                    dragGhost.style.position = 'fixed';
                    dragGhost.style.left = `${rect.left}px`;
                    dragGhost.style.top = `${rect.top}px`;
                    dragGhost.style.width = `${rect.width}px`;
                    dragGhost.style.height = `${rect.height}px`;
                    dragGhost.style.pointerEvents = 'none';
                    dragGhost.style.zIndex = '2000';
                    dragGhost.style.opacity = '0.8';

                    document.body.appendChild(dragGhost);
                    node.style.opacity = '0.3';

                    onDragStart(e);
                    window.removeEventListener('mousemove', handleMousemoveStart);
                    window.addEventListener('mousemove', handleMousemove);
                }
            };

            const handleMousemove = (e: MouseEvent) => {
                if (!isDragging || !dragGhost) return;
                e.preventDefault();
                dragGhost.style.left = `${e.clientX - offsetX}px`;
                dragGhost.style.top = `${e.clientY - offsetY}px`;
            };

            const handleMouseup = () => {
                if (isDragging) {
                    dragGhost?.remove();
                    dragGhost = null;
                    node.style.opacity = '1';
                    isDragging = false;

                    document.body.style.userSelect = '';
                    document.body.style.webkitUserSelect = '';

                    // Call onDragEnd to notify parent component
                    onDragEnd();
                }

                window.removeEventListener('mousemove', handleMousemoveStart);
                window.removeEventListener('mousemove', handleMousemove);
                window.removeEventListener('mouseup', handleMouseup);
            };

            window.addEventListener('mousemove', handleMousemoveStart);
            window.addEventListener('mouseup', handleMouseup);
        };

        // Touch event handlers for mobile support
        const handleTouchstart = (e: TouchEvent) => {
            if ((e.target as HTMLElement).closest('.status-badge') ||
                (e.target as HTMLElement).closest('.resize-handle')) {
                return;
            }

            const touch = e.touches[0];
            dragStartX = touch.clientX;
            dragStartY = touch.clientY;
            hasMoved = false;

            const rect = node.getBoundingClientRect();
            offsetX = touch.clientX - rect.left;
            offsetY = touch.clientY - rect.top;

            const handleTouchmoveStart = (e: TouchEvent) => {
                const touch = e.touches[0];
                const deltaX = Math.abs(touch.clientX - dragStartX);
                const deltaY = Math.abs(touch.clientY - dragStartY);

                if (!isDragging && (deltaX > DRAG_THRESHOLD || deltaY > DRAG_THRESHOLD)) {
                    isDragging = true;
                    hasMoved = true;
                    e.preventDefault();

                    document.body.style.userSelect = 'none';
                    document.body.style.webkitUserSelect = 'none';
                    document.body.style.touchAction = 'none';

                    dragGhost = node.cloneNode(true) as HTMLElement;
                    dragGhost.classList.add('drag-ghost');
                    dragGhost.style.position = 'fixed';
                    dragGhost.style.left = `${rect.left}px`;
                    dragGhost.style.top = `${rect.top}px`;
                    dragGhost.style.width = `${rect.width}px`;
                    dragGhost.style.height = `${rect.height}px`;
                    dragGhost.style.pointerEvents = 'none';
                    dragGhost.style.zIndex = '2000';
                    dragGhost.style.opacity = '0.8';

                    document.body.appendChild(dragGhost);
                    node.style.opacity = '0.3';

                    // Create a synthetic MouseEvent for onDragStart
                    const syntheticEvent = new MouseEvent('mousedown', {
                        clientX: touch.clientX,
                        clientY: touch.clientY,
                        bubbles: true
                    });
                    onDragStart(syntheticEvent);

                    window.removeEventListener('touchmove', handleTouchmoveStart);
                    window.addEventListener('touchmove', handleTouchmove, { passive: false });
                }
            };

            const handleTouchmove = (e: TouchEvent) => {
                if (!isDragging || !dragGhost) return;
                e.preventDefault();
                const touch = e.touches[0];
                dragGhost.style.left = `${touch.clientX - offsetX}px`;
                dragGhost.style.top = `${touch.clientY - offsetY}px`;
            };

            const handleTouchend = () => {
                if (isDragging) {
                    dragGhost?.remove();
                    dragGhost = null;
                    node.style.opacity = '1';
                    isDragging = false;

                    document.body.style.userSelect = '';
                    document.body.style.webkitUserSelect = '';
                    document.body.style.touchAction = '';

                    // Call onDragEnd to notify parent component
                    onDragEnd();
                }

                window.removeEventListener('touchmove', handleTouchmoveStart);
                window.removeEventListener('touchmove', handleTouchmove);
                window.removeEventListener('touchend', handleTouchend);
                window.removeEventListener('touchcancel', handleTouchend);
            };

            window.addEventListener('touchmove', handleTouchmoveStart, { passive: false });
            window.addEventListener('touchend', handleTouchend);
            window.addEventListener('touchcancel', handleTouchend);
        };

        node.addEventListener('mousedown', handleMousedown);
        node.addEventListener('touchstart', handleTouchstart, { passive: true });

        return {
            destroy() {
                node.removeEventListener('mousedown', handleMousedown);
                node.removeEventListener('touchstart', handleTouchstart);
                document.body.style.userSelect = '';
                document.body.style.webkitUserSelect = '';
                document.body.style.touchAction = '';
            }
        };
    }

    function handleResizeStart(e: MouseEvent | TouchEvent, handle: 'top' | 'bottom') {
        e.stopPropagation();
        e.preventDefault();

        isResizing = true;
        resizeHandle = handle;

        const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
        initialY = clientY;
        initialStartMinutes = timeToMinutes(subtask.startTime);
        initialEndMinutes = timeToMinutes(subtask.endTime);
        visualStartMinutes = initialStartMinutes;
        visualEndMinutes = initialEndMinutes;

        document.body.style.userSelect = 'none';
        document.body.style.webkitUserSelect = 'none';
        document.body.style.cursor = 'ns-resize';
        if ('touches' in e) {
            document.body.style.touchAction = 'none';
        }

        const handleMove = (e: MouseEvent | TouchEvent) => {
            if (!isResizing) return;
            e.preventDefault();

            const currentY = 'touches' in e ? e.touches[0].clientY : e.clientY;
            const deltaY = currentY - initialY;
            const deltaMinutes = (deltaY / pixelsPerHour) * 60;

            if (resizeHandle === 'bottom') {
                const rawEndMinutes = initialEndMinutes + deltaMinutes;
                const newEndMinutes = snapToInterval(rawEndMinutes);
                if (newEndMinutes > visualStartMinutes && newEndMinutes <= 1440) {
                    visualEndMinutes = newEndMinutes;
                }
            } else if (resizeHandle === 'top') {
                const rawStartMinutes = initialStartMinutes + deltaMinutes;
                const newStartMinutes = snapToInterval(rawStartMinutes);
                if (newStartMinutes >= 0 && newStartMinutes < visualEndMinutes) {
                    visualStartMinutes = newStartMinutes;
                }
            }
        };

        const handleEnd = () => {
            if (resizeHandle === 'bottom') {
                onResize(visualStartMinutes, visualEndMinutes);
            } else if (resizeHandle === 'top') {
                onResize(visualStartMinutes, visualEndMinutes);
            }

            isResizing = false;
            resizeHandle = null;

            document.body.style.userSelect = '';
            document.body.style.webkitUserSelect = '';
            document.body.style.cursor = '';
            document.body.style.touchAction = '';

            window.removeEventListener('mousemove', handleMove as EventListener);
            window.removeEventListener('mouseup', handleEnd);
            window.removeEventListener('touchmove', handleMove as EventListener);
            window.removeEventListener('touchend', handleEnd);
            window.removeEventListener('touchcancel', handleEnd);
        };

        window.addEventListener('mousemove', handleMove as EventListener);
        window.addEventListener('mouseup', handleEnd);
        window.addEventListener('touchmove', handleMove as EventListener, { passive: false });
        window.addEventListener('touchend', handleEnd);
        window.addEventListener('touchcancel', handleEnd);
    }

    function handleCardClick() {
        if (!hasMoved) {
            onClick();
        }
        hasMoved = false;
    }

    function handleStatusClick(e: Event) {
        e.stopPropagation();

        let newStatus: 'pending' | 'completed' | 'cancelled';
        if (subtask.status === 'pending') {
            newStatus = 'completed';
        } else if (subtask.status === 'completed') {
            newStatus = 'cancelled';
        } else {
            newStatus = 'pending';
        }

        onStatusChange(newStatus);
    }
</script>

<div
        class="floating-subtask"
        class:resizing={isResizing}
        style="
        grid-column: {gridColumn};
        grid-row: 1 / -1;
        pointer-events: none;
    "
>
    <div
            class="subtask-positioner"
            class:being-dragged={isBeingDragged}
            style="
            position: absolute;
            top: {topPosition}px;
            height: {height}px;
            width: 100%;
            pointer-events: auto;
            z-index: 51;
        "
            use:dragSubtask
    >
        <div
                class="resize-handle resize-top"
                on:mousedown={(e) => handleResizeStart(e, 'top')}
                on:touchstart={(e) => handleResizeStart(e, 'top')}
                role="button"
                tabindex="0"
                aria-label="Resize top"
        ></div>
        <div
                class="subtask-card"
                id={"subtask-" + subtask.id}
                class:minimal={!showText}
                class:highlighted={
                ($hoveredSubtaskId !== null && ($hoveredSubtaskId === subtask.id || $hoveredMajorTaskId === subtask.majorTaskId)) ||
                ($hoveredMajorTaskId !== null && $hoveredMajorTaskId === subtask.majorTaskId)
            }
                class:dimmed={
                ($hoveredMajorTaskId !== null && $hoveredMajorTaskId !== subtask.majorTaskId) ||
                ($hoveredSubtaskId !== null && !($hoveredSubtaskId === subtask.id || $hoveredMajorTaskId === subtask.majorTaskId))
            }
                on:mouseenter={() => {
                hoveredSubtaskId.set(subtask.id);
                hoveredMajorTaskId.set(subtask.majorTaskId || null);
            }}
                on:mouseleave={() => {
                hoveredSubtaskId.set(null);
                hoveredMajorTaskId.set(null);
            }}
                on:click={handleCardClick}
                on:keydown={(e) => e.key === 'Enter' && handleCardClick()}
                role="button"
                tabindex="0"
                style="border-color: {majorTaskColor};"
        >
            <div class="task-badges">
                <div class="priority-badge {subtask.priority || 'medium'}">
                    {#if subtask.priority === 'high'}
                        🔴
                    {:else if subtask.priority === 'low'}
                        🟢
                    {:else}
                        🟡
                    {/if}
                </div>
                <button class="status-badge {subtask.status || 'pending'}" on:click={handleStatusClick} type="button">
                    {#if subtask.status === 'completed'}
                        ✓
                    {:else if subtask.status === 'cancelled'}
                        ✕
                    {:else}
                        ○
                    {/if}
                </button>
            </div>
            {#if showText}
                <div class="subtask-content">
                    <span class="subtask-title">{subtask.title}</span>
                </div>
                {#if subtask.majorTaskId}
                    <div class="linked-major-task">
                        <span>Major Task:</span>
                        <span class="linked-title">
                            {#if majorTask}
                                {majorTask.title}
                            {:else}
                                (not found)
                            {/if}
                        </span>
                    </div>
                {/if}
            {/if}
        </div>
        <div
                class="resize-handle resize-bottom"
                on:mousedown={(e) => handleResizeStart(e, 'bottom')}
                on:touchstart={(e) => handleResizeStart(e, 'bottom')}
                role="button"
                tabindex="0"
                aria-label="Resize bottom"
        ></div>
    </div>
</div>

<style>
    .floating-subtask {
        pointer-events: none;
        position: relative;
        height: 100%;
        z-index: 51;
    }

    .subtask-positioner {
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 4px;
        user-select: none;
        -webkit-user-select: none;
        box-sizing: border-box;
        cursor: grab;
        z-index: 51;
        touch-action: none;
    }

    .subtask-positioner.being-dragged {
        opacity: 0.3;
        cursor: grabbing;
    }

    .subtask-positioner.resizing {
        cursor: ns-resize;
    }

    .resize-handle {
        position: absolute;
        left: 8px;
        right: 8px;
        height: 10px;
        cursor: ns-resize;
        z-index: 52;
        opacity: 0;
        transition: opacity 0.2s;
        border-radius: 4px;
        touch-action: none;
    }

    .subtask-positioner:hover .resize-handle {
        opacity: 1;
    }

    /* Make resize handles more visible on touch devices */
    @media (hover: none) and (pointer: coarse) {
        .resize-handle {
            opacity: 0.3;
            height: 16px;
            background: rgba(59, 130, 246, 0.2);
        }

        .resize-handle:active {
            opacity: 1;
            background: rgba(59, 130, 246, 0.5);
        }
    }

    .resize-top {
        top: 4px;
    }

    .resize-bottom {
        bottom: 4px;
    }

    .resize-handle:hover {
        background: rgba(59, 130, 246, 0.4);
    }

    .subtask-card {
        background: white;
        border: 2px solid #333;
        border-radius: 12px;
        padding: 8px;
        color: #333;
        font-size: 0.75rem;
        font-weight: 500;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        transition: transform 0.2s, box-shadow 0.2s, filter 0.2s, opacity 0.2s;
        height: 100%;
        width: 100%;
        max-width: 140px;
        display: flex;
        flex-direction: column;
        align-items: flex-start;
        gap: 6px;
        position: relative;
        user-select: none;
        -webkit-user-select: none;
        box-sizing: border-box;
        overflow: hidden;
        touch-action: none;
    }

    .subtask-card.highlighted {
        z-index: 101;
        box-shadow: 0 0 0 3px #1976d2, 0 4px 12px rgba(25, 118, 210, 0.25);
        filter: none;
        opacity: 1;
    }

    .subtask-card.dimmed {
        filter: grayscale(0.7) brightness(0.7);
        opacity: 0.5;
        z-index: 1;
    }

    @media (max-width: 768px) {
        .subtask-card {
            max-width: 100%;
        }
    }

    .subtask-card.minimal {
        padding: 4px;
        border-radius: 8px;
        min-height: 20px;
        display: flex;
        align-items: center;
        justify-content: center;
        background: #f0f0f0;
        border: 1px solid #666;
    }

    .subtask-card.minimal .task-badges {
        position: static;
        margin: 0;
        margin-top: 4px;
        gap: 1px;
        justify-content: center;
    }

    .subtask-card.minimal .priority-badge,
    .subtask-card.minimal .status-badge {
        width: 10px;
        height: 10px;
        font-size: 7px;
        border-width: 1px;
    }

    .task-badges {
        position: absolute;
        top: 2px;
        right: 2px;
        display: flex;
        gap: 2px;
        align-items: center;
        z-index: 5;
        flex-shrink: 0;
    }

    .priority-badge {
        width: 14px;
        height: 14px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 8px;
        background: rgba(255, 255, 255, 0.95);
        border: 1px solid #ccc;
        flex-shrink: 0;
    }

    .status-badge {
        flex-shrink: 0;
        width: 16px;
        height: 16px;
        border-radius: 50%;
        border: 1px solid #333;
        background: white;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        font-size: 9px;
        font-weight: bold;
        transition: all 0.2s;
        padding: 0;
        z-index: 52;
    }

    /* Make status badge larger on touch devices */
    @media (hover: none) and (pointer: coarse) {
        .status-badge {
            width: 24px;
            height: 24px;
            font-size: 12px;
        }
    }

    .status-badge.completed {
        background: #22c55e;
        border-color: #22c55e;
        color: white;
    }

    .status-badge.cancelled {
        background: #ef4444;
        border-color: #ef4444;
        color: white;
    }

    .status-badge.pending {
        background: white;
        border-color: #333;
        color: #333;
    }

    .status-badge:hover {
        transform: scale(1.15);
    }

    .subtask-content {
        flex: 1;
        width: 100%;
        padding-right: 40px; /* Space for badges */
        padding-top: 10px; /* Move text down to clear badges */
        overflow: ellipsis;
        display: flex;
        align-items: flex-start;
        justify-content: flex-start;
        z-index: 52;
    }

    .subtask-title {
        overflow: hidden;
        text-overflow: ellipsis;
        display: -webkit-box;
        -webkit-line-clamp: 4;
        line-clamp: 4;
        -webkit-box-orient: vertical;
        line-height: 1.2;
        user-select: none;
        -webkit-user-select: none;
        font-size: 0.7rem;
        text-align: left;
        word-break: break-word;
        hyphens: auto;
    }

    .subtask-positioner:hover .subtask-card {
        transform: translateY(-2px);
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
    }

    /* Disable hover effects on touch devices */
    @media (hover: none) and (pointer: coarse) {
        .subtask-positioner:hover .subtask-card {
            transform: none;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }
    }

    :global(.drag-ghost) {
        filter: drop-shadow(0 10px 15px rgba(0, 0, 0, 0.2));
        user-select: none !important;
        -webkit-user-select: none !important;
        touch-action: none !important;
    }
</style>