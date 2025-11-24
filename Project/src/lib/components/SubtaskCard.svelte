<script lang="ts">
    import { majorTasks } from '../stores/majorTasks';
    import { subtasks } from '../stores/subtasks';
    import { get } from 'svelte/store';

    export let subtask: any;
    export let gridColumn: number;
    export let gridRow: number; // Keep for backwards compatibility but won't use
    export let pixelsPerHour: number;
    export let isBeingDragged: boolean = false;
    export let onDragStart: (e: MouseEvent) => void;
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
    const MIN_HEIGHT_FOR_TEXT = 30;
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
                }

                window.removeEventListener('mousemove', handleMousemoveStart);
                window.removeEventListener('mousemove', handleMousemove);
                window.removeEventListener('mouseup', handleMouseup);
            };

            window.addEventListener('mousemove', handleMousemoveStart);
            window.addEventListener('mouseup', handleMouseup);
        };

        node.addEventListener('mousedown', handleMousedown);

        return {
            destroy() {
                node.removeEventListener('mousedown', handleMousedown);
                document.body.style.userSelect = '';
                document.body.style.webkitUserSelect = '';
            }
        };
    }

    function handleResizeStart(e: MouseEvent, handle: 'top' | 'bottom') {
        e.stopPropagation();
        e.preventDefault();

        isResizing = true;
        resizeHandle = handle;
        initialY = e.clientY;
        initialStartMinutes = timeToMinutes(subtask.startTime);
        initialEndMinutes = timeToMinutes(subtask.endTime);
        visualStartMinutes = initialStartMinutes;
        visualEndMinutes = initialEndMinutes;

        document.body.style.userSelect = 'none';
        document.body.style.webkitUserSelect = 'none';
        document.body.style.cursor = 'ns-resize';

        const handleMouseMove = (e: MouseEvent) => {
            if (!isResizing) return;
            e.preventDefault();

            const deltaY = e.clientY - initialY;
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

        const handleMouseUp = () => {
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

            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };

        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseup', handleMouseUp);
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
        class:being-dragged={isBeingDragged}
        class:resizing={isResizing}
        style="
        grid-column: {gridColumn};
        grid-row: 1 / -1;
        pointer-events: none;
    "
>
    <div
            class="subtask-positioner"
            style="
            position: absolute;
            top: {topPosition}px;
            height: {height}px;
            width: 100%;
            pointer-events: auto;
        "
            use:dragSubtask
    >
        <div class="resize-handle resize-top" on:mousedown={(e) => handleResizeStart(e, 'top')}></div>
        <div class="subtask-card" id={"subtask-" + subtask.id} class:minimal={!showText} on:click={handleCardClick} role="button" tabindex="0"
            style="border-color: {majorTaskColor};">
            {#if showText}
                <button class="status-badge {subtask.status || 'pending'}" on:click={handleStatusClick} type="button">
                    {#if subtask.status === 'completed'}
                        ✓
                    {:else if subtask.status === 'cancelled'}
                        ✕
                    {:else}
                        ○
                    {/if}
                </button>
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
        <div class="resize-handle resize-bottom" on:mousedown={(e) => handleResizeStart(e, 'bottom')}></div>
    </div>
</div>

<style>
    .floating-subtask {
        pointer-events: none;
        position: relative;
        height: 100%;
    }

    .subtask-positioner {
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 4px;
        user-select: none;
        -webkit-user-select: none;
        box-sizing: border-box;
        cursor: move;
    }

    .subtask-positioner.being-dragged {
        opacity: 0.3;
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
        z-index: 10;
        opacity: 0;
        transition: opacity 0.2s;
        border-radius: 4px;
    }

    .subtask-positioner:hover .resize-handle {
        opacity: 1;
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
        border-radius: 16px;
        padding: 10px;
        color: #333;
        font-size: 0.75rem;
        font-weight: 500;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        transition: transform 0.2s, box-shadow 0.2s;
        height: 100%;
        width: 100%;
        max-width: 140px;
        display: flex;
        flex-direction: column;
        align-items: flex-start;
        gap: 8px;
        position: relative;
        user-select: none;
        -webkit-user-select: none;
        box-sizing: border-box;
        overflow: hidden;
        border-color: #333; /* fallback, overridden inline */
    }

    .linked-major-task {
        margin-top: 4px;
        font-size: 0.7rem;
        color: #555;
        display: flex;
        gap: 4px;
        align-items: center;
    }
    .linked-title {
        background: #eee;
        border-radius: 8px;
        padding: 2px 6px;
        margin-left: 2px;
        font-size: 0.7rem;
    }

    @media (max-width: 768px) {
        .subtask-card {
            max-width: 100%;
        }
    }

    .subtask-card.minimal {
        padding: 4px;
    }

    .status-badge {
        position: absolute;
        top: 6px;
        right: 6px;
        flex-shrink: 0;
        width: 22px;
        height: 22px;
        border-radius: 50%;
        border: 2px solid #333;
        background: white;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        font-size: 12px;
        font-weight: bold;
        transition: all 0.2s;
        padding: 0;
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
        padding-right: 28px;
        overflow: hidden;
        display: flex;
        align-items: flex-start;
        justify-content: flex-start;
    }

    .subtask-title {
        overflow: hidden;
        text-overflow: ellipsis;
        display: -webkit-box;
        -webkit-line-clamp: 6;
        -webkit-box-orient: vertical;
        line-height: 1.3;
        user-select: none;
        -webkit-user-select: none;
        font-size: 0.75rem;
        text-align: left;
        word-break: break-word;
        hyphens: auto;
    }

    .subtask-positioner:hover .subtask-card {
        transform: translateY(-2px);
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
    }

    :global(.drag-ghost) {
        filter: drop-shadow(0 10px 15px rgba(0, 0, 0, 0.2));
        user-select: none !important;
        -webkit-user-select: none !important;
    }
</style>
